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
      sync_status: 'pending',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    await db.diarios_obra.put(registro);

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

  /**
   * Sincroniza os diários pendentes com o Neon PostgreSQL
   */
  const sincronizarComNeon = async () => {
    try {
      const todosOsDiarios = await db.diarios_obra.toArray();
      
      const pendentes = todosOsDiarios.filter(d => 
        d.sync_status === 'pending' || !d.sync_status || d.sync_status === false
      );

      console.log("Total de registos pendentes para sincronização:", pendentes.length);

      if (!pendentes || pendentes.length === 0) {
        alert("Nenhum registo pendente encontrado para sincronizar.");
        return 0;
      }

      let enviadosComSucesso = 0;

      for (const diario of pendentes) {
        try {
          const payloadNeon = {
            id: diario.id,
            projeto_id: diario.obra_id || diario.projeto_id,
            user_id: diario.user_id,
            data: diario.data_relatorio || diario.data,
            clima_manha: diario.clima_manha || 'sol',
            clima_tarde: diario.clima_tarde || 'sol',
            relato_atividades: diario.relato_atividades || diario.textoRelato,
            ocorrencias: diario.ocorrencias,
            observacoes: diario.observacoes,
            recomendacoes: diario.recomendacoes
          };

          const resposta = await fetch('/api/diarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadNeon)
          });

          if (resposta.ok || resposta.status === 200 || resposta.status === 201) {
            await db.diarios_obra.update(diario.id, { 
              sync_status: 'synced',
              atualizado_em: new Date().toISOString()
            });
            enviadosComSucesso++;
          } else {
            console.error("Erro ao sincronizar diário ID:", diario.id);
          }
        } catch (itemErr) {
          console.error("Exceção ao enviar item:", diario.id, itemErr);
        }
      }

      if (enviadosComSucesso > 0) {
        alert(`✅ Sincronização concluída! (${enviadosComSucesso} registos enviados para o Neon).`);
      } else {
        alert(`⚠️ Verifique a ligação ao servidor de sincronização.`);
      }

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
    sincronizarComNeon,
  };
}

// Exportação por defeito redundante para prevenir qualquer erro de importação
export default useObraVozDB;
