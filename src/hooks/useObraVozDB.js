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
        audio_blob: dadosDiario.audio_blob || null,
        criado_em: new Date().toISOString(),
      });
    }

    return novoId;
  };

  // Substitua a função sincronizarComNeon no seu src/hooks/useObraVozDB.js por esta:
  const sincronizarComNeon = async () => {
    try {
      // Busca todos os diários para garantir que nenhum pendente escape
      const todosOsDiarios = await db.diarios_obra.toArray();
      
      // Filtra os que não estão sincronizados (seja 'pending', undefined ou null)
      const pendentes = todosOsDiarios.filter(d => 
        d.sync_status === 'pending' || !d.sync_status || d.sync_status === false
      );

      console.log("Total de registos encontrados para sincronização:", pendentes.length);

      if (!pendentes || pendentes.length === 0) {
        alert("Nenhum registo pendente encontrado para sincronizar.");
        return 0;
      }

      let enviadosComSucesso = 0;

      for (const diario of pendentes) {
        const resposta = await fetch('/api/diarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(diario)
        });

        if (resposta.ok || resposta.status === 200 || resposta.status === 201) {
          await db.diarios_obra.update(diario.id, { 
            sync_status: 'synced',
            atualizado_em: new Date().toISOString()
          });
          enviadosComSucesso++;
        } else {
          console.error("Falha ao sincronizar diário ID:", diario.id);
        }
      }

      alert(`✅ Sincronização concluída! (${enviadosComSucesso} registos enviados para o Neon).`);
      return enviadosComSucesso;
    } catch (erro) {
      console.error("Erro crítico na sincronização com o Neon:", erro);
      alert("❌ Falha na ligação ao servidor Neon. Verifique a rede.");
      return 0;
    }
  };

  return {
    obras,
    diariosPendentes,
    salvarDiarioOffline,
    sincronizarComNeon, // Exporta a função para ser chamada pelo botão de sincronizar
  };
}
