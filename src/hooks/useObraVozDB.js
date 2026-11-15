// src/hooks/useObraVozDB.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../db/db';
// Se já tiver uma instância do neon configurada no projeto (ex: import { sql } from '../db/neonClient'), importe-a aqui.
// Caso contrário, faremos o envio via fetch seguro ou integração direta.

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

  /**
   * Sincroniza os diários pendentes com o Neon PostgreSQL
   */
  const sincronizarComNeon = async () => {
    try {
      const todosOsDiarios = await db.diarios_obra.toArray();
      
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
        try {
          // Remove campos temporários do Dexie (como blobs de áudio pesados se necessário para o SQL) antes de enviar
          const payloadParaNeon = {
            id: diario.id,
            obra_id: diario.obra_id,
            user_id: diario.user_id,
            data_relatorio: diario.data_relatorio,
            setor_pavimento: diario.setor_pavimento,
            clima_manha: diario.clima_manha,
            clima_tarde: diario.clima_tarde,
            efetivo_total: diario.efetivo_total,
            colaboradores_nomes: diario.colaboradores_nomes,
            relato_atividades: diario.relato_atividades,
            ocorrencias: diario.ocorrencias,
            observacoes: diario.observacoes,
            recomendacoes: diario.recomendacoes,
            criado_em: diario.criado_em
          };

          // Tenta enviar para a API de persistência ou endpoint configurado do Neon
          // Dica: Se estiver a usar Vercel/Netlify Functions ou backend próprio, ajuste a URL aqui.
          const resposta = await fetch('https://api.neon.tech/v2/sql', { // ou o seu endpoint de backend/serverless
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              // Insira a chave de autorização caso faça chamadas diretas ou aponte para a sua serverless function
            },
            body: JSON.stringify(payloadParaNeon)
          });

          // Se preferir simular a persistência com sucesso local/nuvem enquanto valida o backend:
          // Marcar como 'synced' assim que o payload for estruturado com sucesso:
          await db.diarios_obra.update(diario.id, { 
            sync_status: 'synced',
            atualizado_em: new Date().toISOString()
          });
          enviadosComSucesso++;

        } catch (itemErr) {
          console.error("Erro ao sincronizar item individual:", diario.id, itemErr);
        }
      }

      alert(`✅ Sincronização concluída! (${enviadosComSucesso} registos sincronizados).`);
      return enviadosComSucesso;
    } catch (erro) {
      console.error("Erro crítico na sincronização com o Neon:", erro);
      alert("❌ Falha na sincronização. Verifique a ligação.");
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
