// src/services/syncService.js
import { sql } from './neonClient';

// Mapeamento abrangente (incluindo variações com e sem acentos)
const MAPA_OBRAS_UUID = {
  "The Residences Vale do Lobo": "a0000000-0000-0000-0000-000000000001",
  "Residencias Vale do Lobo": "a0000000-0000-0000-0000-000000000001",
  "Obra Geral Algarve": "a0000000-0000-0000-0000-000000000002",
  "Edifício Marina Olhão": "a0000000-0000-0000-0000-000000000003",
  "Edificio Marina Olhao": "a0000000-0000-0000-0000-000000000003"
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const OBRA_PADRAO_NOME = "The Residences Vale do Lobo";
const PROJETO_PADRAO_UUID = "a0000000-0000-0000-0000-000000000001";

// Prepara e valida tanto obra_id (texto/identificador) quanto projeto_id (UUID)
function prepararParaSync(diarioLocal) {
  const origemObra =
    diarioLocal.obra_id ||
    diarioLocal.obra ||
    diarioLocal.nome_obra ||
    OBRA_PADRAO_NOME;

  const obraTexto = String(origemObra).trim() || OBRA_PADRAO_NOME;

  const candidatoUuid = diarioLocal.projeto_id || obraTexto;
  const projetoUuid = UUID_REGEX.test(candidatoUuid)
    ? candidatoUuid
    : (MAPA_OBRAS_UUID[obraTexto] || PROJETO_PADRAO_UUID);

  return {
    ...diarioLocal,
    obra_id: obraTexto,
    projeto_id: projetoUuid
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
      const diarioPronto = prepararParaSync(diario);
      const dataValor =
        diarioPronto.data_relatorio ||
        diarioPronto.data ||
        new Date().toISOString().slice(0, 10);

      await sql`
        INSERT INTO diarios (
          id,
          obra_id,
          projeto_id,
          setor_pavimento,
          clima_manha,
          clima_tarde,
          relato_atividades,
          ocorrencias,
          observacoes,
          recomendacoes,
          data_relatorio,
          data
        )
        VALUES (
          ${diarioPronto.id},
          ${diarioPronto.obra_id},
          ${diarioPronto.projeto_id},
          ${diarioPronto.setor_pavimento || null},
          ${diarioPronto.clima_manha || null},
          ${diarioPronto.clima_tarde || null},
          ${diarioPronto.relato_atividades || diarioPronto.relato || ''},
          ${diarioPronto.ocorrencias || null},
          ${diarioPronto.observacoes || null},
          ${diarioPronto.recomendacoes || null},
          ${dataValor},
          ${diarioPronto.data || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          obra_id = EXCLUDED.obra_id,
          projeto_id = EXCLUDED.projeto_id,
          setor_pavimento = EXCLUDED.setor_pavimento,
          clima_manha = EXCLUDED.clima_manha,
          clima_tarde = EXCLUDED.clima_tarde,
          relato_atividades = EXCLUDED.relato_atividades,
          ocorrencias = EXCLUDED.ocorrencias,
          observacoes = EXCLUDED.observacoes,
          recomendacoes = EXCLUDED.recomendacoes,
          data_relatorio = EXCLUDED.data_relatorio,
          updated_at = CURRENT_TIMESTAMP;
      `;

      const agora = new Date().toISOString();
await localDb.diarios_obra.update(diario.id, {
  synced: 1,
  sync_status: 'synced',
  atualizado_em: agora,
});

const local = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
const novoLocal = local.map((d) =>
  d.id === diario.id ? { ...d, synced: 1, sync_status: 'synced' } : d
);
localStorage.setItem('obravoz_diarios_offline', JSON.stringify(novoLocal));
    }

    console.log('✅ Sincronização concluída com sucesso!');
    return { success: true, syncedCount: obrasPendentes.length + diariosPendentes.length };

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    return { success: false, error: error.message };
  }
}
