import { sql } from './neonClient';

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
      await sql`
        INSERT INTO diarios (id, projeto_id, data)
        VALUES (
          ${diario.id}, 
          ${diario.obra_id}, 
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
