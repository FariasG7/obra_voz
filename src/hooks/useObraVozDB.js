// src/hooks/useObraVozDB.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../db/db';

export function useObraVozDB() {
  // Lista reativa de obras para popular o campo de seleção
  const obras = useLiveQuery(() => db.obras.toArray(), []);




// src/hooks/useObraVozDB.js (Função sincronizarComNeon atualizada)
  const sincronizarComNeon = async () => {
    try {
      const todosOsDiarios = await db.diarios_obra.toArray();
      
      const pendentes = todosOsDiarios.filter(d => 
        d.sync_status === 'pending' || !d.sync_status || d.sync_status === false
      );

      console.log("Total de registos pendentes detetados no Dexie:", pendentes.length);

      if (!pendentes || pendentes.length === 0) {
        alert("Nenhum registo pendente encontrado para sincronizar.");
        return 0;
      }

      let enviadosComSucesso = 0;

      for (const diario of pendentes) {
        try {
          // Tenta o envio para a API de sync do Neon
          const resposta = await fetch('/api/diarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
              recomendacoes: diario.recomendacoes
            })
          });

          // Se o endpoint responder com sucesso
          if (resposta.ok) {
            await db.diarios_obra.update(diario.id, { 
              sync_status: 'synced',
              atualizado_em: new Date().toISOString()
            });
            enviadosComSucesso++;
            console.log(`Registo ${diario.id} sincronizado com sucesso.`);
          } else {
            const erroTexto = await resposta.text();
            console.error(`Erro do servidor ao enviar diário ${diario.id}:`, erroTexto);
          }
        } catch (innerErr) {
          console.error(`Exceção de rede ao enviar diário ${diario.id}:`, innerErr);
        }
      }

      if (enviadosComSucesso > 0) {
        alert(`✅ Sincronização concluída! (${enviadosComSucesso} registos enviados para o Neon).`);
      } else {
        alert(`⚠️ A sincronização tentou enviar os diários, mas o servidor recusou. Verifique a consola para mais detalhes.`);
      }

      return enviadosComSucesso;
    } catch (erro) {
      console.error("Erro crítico na sincronização com o Neon:", erro);
      alert("❌ Falha na sincronização. Verifique a ligação.");
      return 0;
    }
  };
