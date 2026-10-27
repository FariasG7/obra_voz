import { sql } from './neonClient';

/**
 * Executa a sincronização dos dados locais (Dexie) com o Neon (Postgres)
 * @param {Object} localDb - Instância do Dexie.js da aplicação
 */
export async function sincronizarComNuvem(localDb) {
  if (!navigator.onLine) {
    console.log('📡 Dispositivo offline. A sincronização foi ignorada por agora.');
    return { success: false, reason: 'offline' };
  }

  try {
    console.log('🔄 A iniciar sincronização com o Neon...');

    // 1. Sincronizar Projetos Pendentes
    // Nota: Certifique-se de que os seus registos no Dexie têm um campo 'synced' (0 para pendente, 1 para sincronizado)
    const projetosPendentes = await localDb.projetos.where('synced').equals(0).toArray();

    for (const projeto of projetosPendentes) {
      await sql`
        INSERT INTO projetos (id, nome, localizacao, cliente, data_inicio, status)
        VALUES (
          ${projeto.id}, 
          ${projeto.nome}, 
          ${projeto.localizacao || null}, 
          ${projeto.cliente || null}, 
          ${projeto.data_inicio || null}, 
          ${projeto.status || 'em_andamento'}
        )
        ON CONFLICT (id) DO UPDATE SET
          nome = EXCLUDED.nome,
          localizacao = EXCLUDED.localizacao,
          cliente = EXCLUDED.cliente,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP;
      `;

      // Atualiza o estado local para sincronizado
      await localDb.projetos.update(projeto.id, { synced: 1 });
    }

    // 2. Sincronizar Diários de Obra Pendentes
    const diariosPendentes = await localDb.diarios.where('synced').equals(0).toArray();

    for (const diario of diariosPendentes) {
      await sql`
        INSERT INTO diarios (id, projeto_id, data, clima, resumo_atividades, observacoes, audio_transcricao, equipe_presente)
        VALUES (
          ${diario.id}, 
          ${diario.projeto_id}, 
          ${diario.data}, 
          ${diario.clima || null}, 
          ${diario.resumo_atividades || null}, 
          ${diario.observacoes || null}, 
          ${diario.audio_transcricao || null}, 
          ${diario.equipe_presente || 0}
        )
        ON CONFLICT (id) DO UPDATE SET
          clima = EXCLUDED.clima,
          resumo_atividades = EXCLUDED.resumo_atividades,
          observacoes = EXCLUDED.observacoes,
          audio_transcricao = EXCLUDED.audio_transcricao,
          equipe_presente = EXCLUDED.equipe_presente,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await localDb.diarios.update(diario.id, { synced: 1 });
    }

    console.log('✅ Sincronização concluída com sucesso!');
    return { success: true, syncedCount: projetosPendentes.length + diariosPendentes.length };

  } catch (error) {
    console.error('❌ Erro durante o processo de sincronização:', error);
    return { success: false, error: error.message };
  }
}
