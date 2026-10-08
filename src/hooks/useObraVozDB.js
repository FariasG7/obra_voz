// src/hooks/useObraVozDB.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../db/db';

export function useObraVozDB() {
  // Lista reativa de obras para popular o campo de seleção
  const obras = useLiveQuery(() => db.obras.toArray(), []);

  // Lista reativa de diários pendentes de sincronização
  const diariosPendentes = useLiveQuery(
    () => db.diarios_obra.where('sync_status').equals('pending').toArray(),
    []
  );

  /**
   * Salva um novo Diário de Obra offline no IndexedDB
   */
  const salvarDiarioOffline = async (dadosDiario) => {
    const novoId = dadosDiario.id || generateUUID();

    const registro = {
      id: novoId,
      obra_id: dadosDiario.obra_id,
      user_id: dadosDiario.user_id || null,
      data_relatorio: dadosDiario.data_relatorio || new Date().toISOString().split('T')[0],
      setor_pavimento: dadosDiario.setor_pavimento || '',
      clima_manha: dadosDiario.clima_manha || 'sol',
      clima_tarde: dadosDiario.clima_tarde || 'sol',
      efetivo_total: dadosDiario.efetivo_total || 0,
      colaboradores_nomes: dadosDiario.colaboradores_nomes || [],
      relato_atividades: dadosDiario.relato_atividades || '',
      ocorrencias: dadosDiario.ocorrencias || '',
      observacoes: dadosDiario.observacoes || '',
      recomendacoes: dadosDiario.recomendacoes || '',
      sync_status: 'pending', // Marca como pendente para envio futuro ao Neon
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    await db.diarios_obra.put(registro);

    // Se houver dados de áudio/transcrição associados:
    if (dadosDiario.transcricao_bruta || dadosDiario.audio_blob) {
      await db.midias_audio.put({
        id: generateUUID(),
        diario_id: novoId,
        transcricao_bruta: dadosDiario.transcricao_bruta || '',
        audio_blob: dadosDiario.audio_blob || null, // Blob salvo temporariamente no IndexedDB
        criado_em: new Date().toISOString(),
      });
    }

    return novoId;
  };

  return {
    obras,
    diariosPendentes,
    salvarDiarioOffline,
  };
}
