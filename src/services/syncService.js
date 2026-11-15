// src/services/syncService.js
import { sql } from './neonClient';

// Mapeamento de nomes para os UUIDs reais cadastrados no Neon/PostgreSQL
const MAPA_OBRAS_UUID = {
  "Residencias Vale do Lobo": "a0000000-0000-0000-0000-000000000001",
  "Obra Geral Algarve": "a0000000-0000-0000-0000-000000000002",
  "Edifício Marina Olhão": "a0000000-0000-0000-0000-000000000003"
};

// Prepara e converte o ID da obra para um UUID válido exigido pelo PostgreSQL
function prepararParaSync(diarioLocal) {
  const obraIdFormatado = MAPA_OBRAS_UUID[diarioLocal.obra_id] || "a0000000-0000-0000-0000-000000000001"; // Fallback se não encontrar

  return {
    ...diarioLocal,
    obra_id: obraIdFormatado
  };
}

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
      // Aplica a função de conversão para UUID antes de enviar ao banco
      const diarioPronto = prepararParaSync(diario);

      await sql`
        INSERT INTO diarios (id, projeto_id, data)
        VALUES (
          ${diarioPronto.id}, 
          ${diarioPronto.projeto_id || diarioPronto.obra_id}, 
          ${diarioPronto.data_relatorio}
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
