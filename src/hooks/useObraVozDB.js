  // src/hooks/useObraVozDB.js (Ajustado para o esquema exato do Neon)
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
          // Mapeia os campos locais para os nomes exatos das colunas da tabela 'diarios' no Neon
          const payloadNeon = {
            id: diario.id,
            projeto_id: diario.obra_id || diario.projeto_id, // Mapeia obra_id para projeto_id do Neon
            user_id: diario.user_id,
            data: diario.data_relatorio || diario.data,       // Mapeia data_relatorio para data
            clima_manha: diario.clima_manha || 'sol',
            clima_tarde: diario.clima_tarde || 'sol',
            relato_atividades: diario.relato_atividades || diario.textoRelato,
            ocorrencias: diario.ocorrencias,
            observacoes: diario.observacoes,
            recomendacoes: diario.recomendacoes
          };

          const resposta = await fetch('/api/diarios', { // ou o seu endpoint de backend/serverless conectado ao Neon
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
