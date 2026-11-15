import { sql } from './neonClient';

// Mapeamento fixo dos nomes das obras para os UUIDs reais correspondentes na base de dados Neon
const MAPA_OBRAS_UUID = {
  "Residencias Vale do Lobo": "a0000000-0000-0000-0000-000000000001", // Substitua pelo UUID real da tabela 'projetos'
  "Obra Geral Algarve": "a0000000-0000-0000-0000-000000000002",
  "Edificio Marina Olhao": "a0000000-0000-0000-0000-000000000003"
};

export async function sincronizarComNuvem(localDb) {
  if (!navigator.onLine) {
    console.log('📡 Dispositivo offline. Sincronização ignorada.');
    return { success: false, reason: 'offline' };
  }

  try {
    console.log('🔄 A iniciar sincronização com o Neon...');

    // 1. Sincronizar Obras Pendentes
    const obrasPendentes = await localDb.obras.where('synced').equals(0).toArray();

    for (const obra of obrasPendentes) {
      // Se o ID local da obra não for um UUID válido, garantimos um UUID ou usamos o ID
      await sql`
        INSERT INTO projetos (id, nome, status)
        VALUES (
          ${obra.id}, 
          ${obra.nome_obra}, 
          ${obra.status || 'em_andamento'}
        )
        ON CONFLICT (id) DO UPDATE SET
          nome = EXCLUDED.nome,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await localDb.obras.update(obra.id, { synced: 1 });
    }

    // 2. Sincronizar Diários de Obra Pendentes
    const diariosPendentes = await localDb.diarios_obra.where('synced').equals(0).toArray();

    for (const diario of diariosPendentes) {
      // Converte o nome da obra em texto para o UUID correspondente no Neon
      // Se não encontrar no mapa, usa um UUID padrão de fallback ou o próprio valor se já for UUID
      const projetoIdUuid = MAPA_OBRAS_UUID[diario.obra_id] || diario.obra_id;

      await sql`
        INSERT INTO diarios (id, projeto_id, data)
        VALUES (
          ${diario.id}, 
          ${projetoIdUuid}, 
          ${diario.data_relatorio}
        )
        ON CONFLICT (id) DO UPDATE SET
          updated_at = CURRENT_TIMESTAMP;
      `;

      await localDb.diarios_obra.update(diario.id, { synced: 1 });
    }

    console.log('✅ Sincronização concluída com sucesso!');
    return { success: true, syncedCount: obrasPendentes.length + diariosPendentes.length };

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    return { success: false, error: error.message };
  }
}
