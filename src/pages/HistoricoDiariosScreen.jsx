// src/pages/HistoricoDiariosScreen.jsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';
import { useObraVozDB } from '../hooks/useObraVozDB';

export function HistoricoDiariosScreen({ onSelecionarDiario }) {
  const { sincronizarComNeon, diariosPendentes } = useObraVozDB();
  // Lista reativa de todos os diários guardados no Dexie.js ordenados por data decrescente
  const diarios = useLiveQuery(() => db.diarios_obra.orderBy('data_relatorio').reverse().toArray(), []);
  
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  const handleForcarSincronizacao = async () => {
    if (!navigator.onLine) {
      setMensagemStatus('⚠️ Sem ligação à internet. Conecte-se para sincronizar.');
      setTimeout(() => setMensagemStatus(''), 3000);
      return;
    }

    setSincronizando(true);
    setMensagemStatus('🔄 A sincronizar diários com a nuvem...');

    try {
      const resultado = await sincronizarComNuvem(db);
      if (resultado.success) {
        setMensagemStatus(`✅ Sincronização concluída! (${resultado.syncedCount} registos enviados)`);
      } else {
        setMensagemStatus(`❌ Erro na sincronização: ${resultado.reason || resultado.error}`);
      }
    } catch (error) {
      console.error('Erro ao forçar sincronização:', error);
      setMensagemStatus('❌ Erro inesperado ao sincronizar.');
    } finally {
      setSincronizando(false);
      setTimeout(() => setMensagemStatus(''), 4000);
    }
  };


  
  return (
    <div className="content historico-content-wrapper">
      
      {/* Cabeçalho do Ecrã */}
      <div className="historico-header">
        <div>
          <h2 className="historico-titulo">
            📋 Histórico de Diários
          </h2>
          <p className="historico-subtitulo">
            Registos guardados localmente no dispositivo
          </p>
        </div>


// No botão de sincronizar:
<button onClick={sincronizarComNeon} className="obra-sync-btn">
  🔄 Sincronizar ({diariosPendentes?.length || 0} pendentes)
</button>
        
        <button
          onClick={handleForcarSincronizacao}
          disabled={sincronizando}
          className="btn-forcar-sync"
        >
          {sincronizando ? '🔄 A enviar...' : '☁️ Sincronizar'}
        </button>
      </div>

      {/* Mensagem de Feedback de Sync */}
      {mensagemStatus && (
        <div className="historico-status-msg">
          {mensagemStatus}
        </div>
      )}

      {/* Lista de Diários */}
      {!diarios ? (
        <p style={{ textAlign: 'center', color: '#888' }}>A carregar diários...</p>
      ) : diarios.length === 0 ? (
        <div className="card historico-vazio-card">
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📭 Nenhum diário registado ainda.</p>
          <p style={{ fontSize: '0.85rem' }}>Os diários criados em campo aparecerão aqui.</p>
        </div>
      ) : (
        <div className="historico-lista">
          {diarios.map((diario) => {
            const isPendente = diario.synced === 0 || diario.sync_status === 'pending';

            return (
              <div 
                key={diario.id}
                className="card historico-item-card"
                onClick={() => onSelecionarDiario && onSelecionarDiario(diario)}
              >
                {/* Linha Superior: Data e Status */}
                <div className="historico-item-header">
                  <span className="historico-item-data">
                    📅 {diario.data_relatorio || diario.data}
                  </span>
                  
                  <span className={isPendente ? 'historico-badge-pendente' : 'historico-badge-sincronizado'}>
                    {isPendente ? '🟡 Pendente (Offline)' : '🟢 Sincronizado'}
                  </span>
                </div>

                {/* Setor e Clima */}
                <div className="historico-item-detalhes">
                  <strong>Setor:</strong> {diario.setor_pavimento || 'Geral'} | <strong>Clima:</strong> {diario.clima_manha || diario.clima || 'Não registado'}
                </div>

                {/* Prévia do Relato */}
                <p className="historico-item-relato">
                  {diario.relato_atividades || diario.textoRelato || 'Sem relato escrito.'}
                </p>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default HistoricoDiariosScreen;
