// Adicione o estado no HistoricoDiariosScreen.jsx:


{/* No cabeçalho do Histórico, adicione o botão: */}


{/* No final do componente, renderize o modal se ativado: */}




// src/pages/HistoricoDiariosScreen.jsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useObraVozDB } from '../hooks/useObraVozDB';

export function HistoricoDiariosScreen({ onSelecionarDiario }) {

  const [mostrarGestaoModal, setMostrarGestaoModal] = useState(false);
  
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
    setMensagemStatus('🔄 A sincronizar diários com o Neon...');

    try {
      // Chama a função correta do hook useObraVozDB
      const enviados = await sincronizarComNeon();
      
      if (enviados > 0) {
        setMensagemStatus(`✅ Sincronização concluída! (${enviados} registos enviados)`);
      } else {
        setMensagemStatus(`ℹ️ Nenhum registo novo foi enviado (já estão sincronizados).`);
      }
    } catch (error) {
      console.error('Erro ao forçar sincronização:', error);
      setMensagemStatus('❌ Erro inesperado ao sincronizar com o Neon.');
    } finally {
      setSincronizando(false);
      setTimeout(() => setMensagemStatus(''), 4000);
    }
  };

  return (
    <div className="content historico-content-wrapper">
      
      {/* Cabeçalho do Ecrã */}
      <div className="historico-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 className="historico-titulo">
            📋 Histórico de Diários
          </h2>
          <p className="historico-subtitulo" style={{ color: '#888', fontSize: '0.85rem' }}>
            Registos guardados localmente no dispositivo
          </p>
        </div>


        <button
  onClick={() => setMostrarGestaoModal(true)}
  className="btn-gestao-relatorios"
  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
>
  ⚙️ Gerir / Editar Relatórios
</button>
        <button
          onClick={handleForcarSincronizacao}
          disabled={sincronizando}
          className="obra-sync-btn"
        >
          {sincronizando ? '🔄 A enviar...' : `☁️ Sincronizar (${diariosPendentes?.length || 0} pendentes)`}
        </button>
      </div>

      {/* Mensagem de Feedback de Sync */}
      {mensagemStatus && (
        <div className="historico-status-msg" style={{ background: 'rgba(42, 161, 192, 0.15)', border: '1px solid #2AA1C0', color: '#5AB3D4', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', textAlign: 'center' }}>
          {mensagemStatus}
        </div>
      )}

      {/* Lista de Diários */}
      {!diarios ? (
        <p style={{ textAlign: 'center', color: '#888' }}>A carregar diários...</p>
      ) : diarios.length === 0 ? (
        <div className="card historico-vazio-card">
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📭 Nenhum diário registado ainda.</p>
          <p style={{ fontSize: '0.85rem', color: '#888' }}>Os diários criados em campo aparecerão aqui.</p>
        </div>
      ) : (
        <div className="historico-lista" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {diarios.map((diario) => {
            const isPendente = diario.sync_status === 'pending' || !diario.sync_status || diario.sync_status === false;

            return (
              <div 
                key={diario.id}
                className="card historico-item-card"
                onClick={() => onSelecionarDiario && onSelecionarDiario(diario)}
                style={{ cursor: 'pointer' }}
              >
                {/* Linha Superior: Data e Status */}
                <div className="historico-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="historico-item-data" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    📅 {diario.data_relatorio || diario.data}
                  </span>
                  
                  <span className={isPendente ? 'historico-badge-pendente' : 'historico-badge-sincronizado'} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: isPendente ? 'rgba(235, 149, 50, 0.2)' : 'rgba(22, 160, 133, 0.2)', color: isPendente ? '#f6b93b' : '#2ecc71' }}>
                    {isPendente ? '🟡 Pendente (Offline)' : '🟢 Sincronizado'}
                  </span>
                </div>

                {/* Setor e Clima */}
                <div className="historico-item-detalhes" style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>
                  <strong>Setor:</strong> {diario.setor_pavimento || 'Geral'} | <strong>Clima:</strong> {diario.clima_manha || diario.clima || 'Não registado'}
                </div>

                {/* Prévia do Relato */}
                <p className="historico-item-relato" style={{ fontSize: '0.9rem', color: '#ccc', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {diario.relato_atividades || diario.textoRelato || 'Sem relato escrito.'}
                  {mostrarGestaoModal && (
  <GestaoRelatoriosModal onClose={() => setMostrarGestaoModal(false)} />
)}
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
