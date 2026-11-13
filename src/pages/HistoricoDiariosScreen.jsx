import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService'; // Ajuste o caminho se necessário
import '../App.css';

export function HistoricoDiariosScreen({ onSelecionarDiario }) {
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
    <div className="content" style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
      
      {/* Cabeçalho do Ecrã */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: 'var(--blue-light, #3b82f6)', fontSize: '1.4rem', fontWeight: 'bold' }}>
            📋 Histórico de Diários
          </h2>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '2px' }}>
            Registos guardados localmente no dispositivo
          </p>
        </div>

        <button
          onClick={handleForcarSincronizacao}
          disabled={sincronizando}
          style={{
            background: 'var(--blue-primary, #2563eb)',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {sincronizando ? '🔄 A enviar...' : '☁️ Sincronizar'}
        </button>
      </div>

      {/* Mensagem de Feedback de Sync */}
      {mensagemStatus && (
        <div style={{ marginBottom: '15px', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', textAlign: 'center', fontSize: '0.9rem' }}>
          {mensagemStatus}
        </div>
      )}

      {/* Lista de Diários */}
      {!diarios ? (
        <p style={{ textAlign: 'center', color: '#888' }}>A carregar diários...</p>
      ​) : diarios.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📭 Nenhum diário registado ainda.</p>
          <p style={{ fontSize: '0.85rem' }}>Os diários criados em campo aparecerão aqui.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {diarios.map((diario) => {
            const isPendente = diario.synced === 0 || diario.sync_status === 'pending';

            return (
              <div 
                key={diario.id}
                className="card"
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onClick={() => onSelecionarDiario && onSelecionarDiario(diario)}
              >
                {/* Linha Superior: Data e Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>
                    📅 {diario.data_relatorio || diario.data}
                  </span>
                  
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    background: isPendente ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: isPendente ? '#facc15' : '#4ade80',
                    border: `1px solid ${isPendente ? 'rgba(234, 179, 8, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                  }}>
                    {isPendente ? '🟡 Pendente (Offline)' : '🟢 Sincronizado'}
                  </span>
                </div>

                {/* Setor e Clima */}
                <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                  <strong>Setor:</strong> {diario.setor_pavimento || 'Geral'} | <strong>Clima:</strong> {diario.clima_manha || diario.clima || 'Não registado'}
                </div>

                {/* Prévia do Relato */}
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: '#999', 
                  margin: '4px 0 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
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
