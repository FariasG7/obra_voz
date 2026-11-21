// src/hooks/useObraVozDB.js
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function useObraVozDB() {
  // Lista reativa de obras para popular o campo de seleção
  const obras = useLiveQuery(() => db.obras.toArray(), []);

  // Lista reativa de diários pendentes (cobre sync_status === 'pending', ausente ou synced === 0)
  const diariosPendentes = useLiveQuery(async () => {
    const todos = await db.diarios_obra.toArray();
    return todos.filter(
      (d) =>
        d.sync_status === 'pending' ||
        d.sync_status === false ||
        (!d.sync_status && d.synced !== 1)
    );
  }, []);

  /**
   * Salva um novo Diário de Obra offline no IndexedDB
   */
  const salvarDiarioOffline = async (dadosDiario) => {
    const novoId = dadosDiario.id || generateUUID();
    const agora = new Date().toISOString();

    const registro = {
      id: novoId,
      obra_id: dadosDiario.obra_id,
      user_id: dadosDiario.user_id || null,
      data_relatorio: dadosDiario.data_relatorio || agora.split('T')[0],
      setor_pavimento: dadosDiario.setor_pavimento || '',
      clima_manha: dadosDiario.clima_manha || 'sol',
      clima_tarde: dadosDiario.clima_tarde || 'sol',
      efetivo_total: dadosDiario.efetivo_total || 0,
      colaboradores_nomes: dadosDiario.colaboradores_nomes || [],
      relato_atividades: dadosDiario.relato_atividades || '',
      ocorrencias: dadosDiario.ocorrencias || '',
      observacoes: dadosDiario.observacoes || '',
      recomendacoes: dadosDiario.recomendacoes || '',
      synced: 0,
      sync_status: 'pending',
      criado_em: agora,
      atualizado_em: agora,
    };

    await db.diarios_obra.put(registro);

    if (dadosDiario.transcricao_bruta || dadosDiario.audio_blob) {
      await db.midias_audio.put({
        id: generateUUID(),
        diario_id: novoId,
        transcricao_bruta: dadosDiario.transcricao_bruta || '',
        audio_blob: dadosDiario.audio_blob || null,
        criado_em: agora,
      });
    }

    return novoId;
  };

  /**
   * Sincroniza obras e diários pendentes diretamente com o Neon via syncService
   */
  const sincronizarComNeon = async () => {
    try {
      const todosOsDiarios = await db.diarios_obra.toArray();
      const pendentes = todosOsDiarios.filter(
        (d) =>
          d.sync_status === 'pending' ||
          d.sync_status === false ||
          (!d.sync_status && d.synced !== 1)
      );

      if (!pendentes || pendentes.length === 0) {
        alert('Nenhum registo pendente encontrado para sincronizar.');
        return 0;
      }

      const resultado = await sincronizarComNuvem(db);

      if (!resultado.success) {
        alert(`⚠️ Falha na sincronização com o Neon: ${resultado.error || resultado.reason}`);
        return 0;
      }

      // Garante que sync_status e localStorage reflitam os itens já enviados
      const idsPendentes = new Set(pendentes.map((p) => p.id));
      const agora = new Date().toISOString();

      for (const id of idsPendentes) {
        await db.diarios_obra.update(id, {
          synced: 1,
          sync_status: 'synced',
          atualizado_em: agora,
        });
      }

      const local = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      const novoLocal = local.map((d) =>
        idsPendentes.has(d.id) ? { ...d, synced: 1, sync_status: 'synced' } : d
      );
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(novoLocal));

      const enviados = resultado.syncedCount ?? pendentes.length;
      if (enviados > 0) {
        alert(`✅ Sincronização concluída! (${enviados} registos sincronizados com sucesso).`);
      } else {
        alert('⚠️ Nenhum registo foi alterado.');
      }

      return enviados;
    } catch (erro) {
      console.error('Erro crítico na sincronização:', erro);
      alert('❌ Falha na sincronização.');
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

export default useObraVozDB;
