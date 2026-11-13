import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';
import '../App.css';

export function HistoricoDocumentalPage() {
  // Lista reativa de diários do Dexie ordenada por data decrescente
  const diarios = useLiveQuery(() => db.diarios_obra.orderBy('data_relatorio').reverse().toArray(), []);

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos', 'pendente', 'sincronizado'
  const [diarioSelecionado, setDiarioSelecionado] = useState(null); // Para modal de visualização/edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [textoEditado, setTextoEditado] = useState('');
  const [setorEditado, setSetorEditado] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [sincronizando, setSincronizando] = useState(false);

  // Filtragem de diários (busca por texto, setor ou data)
  const diariosFiltrados = diarios?.filter(diario => {
    const texto = (diario.textoRelato || diario.relato_atividades || '').toLowerCase();
    const setor = (diario.setor_pavimento || '').toLowerCase();
    const data = (diario.data_relatorio || diario.data || '').toLowerCase();
    const termo = termoBusca.toLowerCase();

    const correspondeBusca = texto.includes(termo) || setor.includes(termo) || data.includes(termo);
    
    const isPendente = diario.synced === 0 || diario.sync_status === 'pending';
    if (filtroStatus === 'pendente') return correspondeBusca && isPendente;
    if (filtroStatus === 'sincronizado') return correspondeBusca && !isPendente;

    return correspondeBusca;
  });

  const abrirDetalhes = (diario) => {
    setDiarioSelecionado(diario);
    setTextoEditado(diario.textoRelato || diario.relato_atividades || '');
    setSetorEditado(diario.setor_pavimento || '');
    setModoEdicao(false);
  };

  const fecharModal = () => {
    setDiarioSelecionado(null);
    setModoEdicao(false);
    setStatusMsg('');
  };

  const handleGuardarEdicao = async (e) => {
    e.preventDefault();
    if (!diarioSelecionado) return;

    try {
      await db.diarios_obra.update(diarioSelecionado.id, {
        textoRelato: textoEditado,
        relato_atividades: textoEditado,
        setor_pavimento: setorEditado,
        synced: 0 // Marca como pendente para re-sincronizar alteração na nuvem
      });

      setStatusMsg('✅ RDO atualizado localmente!');
      setTimeout(() => {
        fecharModal();
      }, 1500);
    } catch (error) {
      console.error('Erro ao atualizar RDO:', error);
      setStatusMsg('❌ Erro ao guardar alterações.');
    }
  };

  const handleForcarSync = async () => {
    if (!navigator.onLine) {
      alert('⚠️ Dispositivo offline. Conecte-se à internet para sincronizar.');
      return;
    }
    setSincronizando(true);
    try {
      const res = await sincronizarComNuvem(db);
      if (res.success) {
        alert(`✅ Sincronizado com sucesso! (${res.syncedCount} itens enviados)`);
      } else {
        alert(`⚠️ Erro na sincronização: ${res.error || res.reason}`);
      }
    } catch (err) {
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div className="content" style={{ maxWidth: '700px', margin: '0 auto', padding: '15px' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: 'var(--blue-light, #3b82f6)', fontSize: '1.4rem', fontWeight: 'bold' }}>
            📚 Histórico Documental
          </h2>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '2px' }}>
            Consulta, pesquisa e edição de RDOs guardados no dispositivo
          </p>
        </div>

        <button
          onClick={handleForcarSync}
          disabled={sincronizando}
          style={{
            background: 'var(--blue-primary, #2563eb)',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {sincronizando ? '🔄 A enviar...' : '☁️ Sincronizar'}
        </button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="card" style={{ padding: '12px', marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Pesquisar por setor, texto ou data..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #444',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '0.9rem'
          }}
        />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #444',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '0.9rem'
          }}
        >
          <option value="todos">Todos os Estados</option>
          <option value="pendente">🟡 Pendentes (Offline)</option>
          <option value="sincronizado">🟢 Sincronizados</option>
        </select>
      </div>

      {/* Lista de Registos */}
      {!diariosFiltrados ? (
        <p style={{ textAlign: 'center', color: '#888' }}>A carregar histórico...</p>
      ) : diariosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📭 Nenhum RDO encontrado.</p>
          <p style={{ fontSize: '0.85rem' }}>Tente ajustar os termos de pesquisa ou filtros.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {diariosFiltrados.map((diario) => {
            const isPendente = diario.synced === 0 || diario.sync_status === 'pending';

            return (
              <div
                key={diario.id}
                className="card"
                onClick={() => abrirDetalhes(diario)}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff' }}>
                    📅 {diario.data_relatorio || diario.data}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    background: isPendente ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: isPendente ? '#facc15' : '#4ade80',
                    border: `1px solid ${isPendente ? 'rgba(234, 179, 8, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                  }}>
                    {isPendente ? '🟡 Pendente' : '🟢 Sincronizado'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                  <strong>Setor:</strong> {diario.setor_pavimento || 'Geral'} | <strong>Clima:</strong> {diario.clima || 'Não registado'}
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: '#999',
                  margin: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {diario.textoRelato || diario.relato_atividades || 'Sem relato preenchido.'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALHES E EDIÇÃO */}
      {diarioSelecionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '15px'
        }}>
          <div style={{
            background: '#1e1e1e',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            borderRadius: '12px',
            border: '1px solid #444',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
          }}>
            {/* Header Modal */}
            <div style={{ padding: '15px 20px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                {modoEdicao ? '✏️ Editar RDO' : '🔍 Detalhes do RDO'}
              </h3>
              <button onClick={fecharModal} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Corpo Modal */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Data do Registo</span>
                <p style={{ margin: '2px 0 0 0', color: '#fff', fontWeight: 'bold' }}>{diarioSelecionado.data_relatorio || diarioSelecionado.data}</p>
              </div>

              {!modoEdicao ? (
                <>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Setor / Pavimento</span>
                    <p style={{ margin: '2px 0 0 0', color: '#fff' }}>{diarioSelecionado.setor_pavimento || 'Não especificado'}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Condição Atmosférica</span>
                    <p style={{ margin: '2px 0 0 0', color: '#fff' }}>{diarioSelecionado.clima || 'Não registado'}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Relato de Atividades</span>
                    <p style={{ margin: '4px 0 0 0', color: '#ddd', background: '#121212', padding: '12px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                      {diarioSelecionado.textoRelato || diarioSelecionado.relato_atividades || 'Sem relato.'}
                    </p>
                  </div>

                  {/* Fotos anexadas se houver */}
                  {diarioSelecionado.fotosBase64 && diarioSelecionado.fotosBase64.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>Registo Fotográfico ({diarioSelecionado.fotosBase64.length})</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {diarioSelecionado.fotosBase64.map((foto, idx) => (
                          <img key={idx} src={foto} alt={`Foto ${idx}`} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #444' }} />
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setModoEdicao(true)}
                    style={{
                      marginTop: '10px',
                      background: 'var(--blue-primary, #2563eb)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar este Registo
                  </button>
                </>
              ) : (
                <form onSubmit={handleGuardarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="campo-group">
                    <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>Setor / Pavimento</label>
                    <input
                      type="text"
                      value={setorEditado}
                      onChange={(e) => setSetorEditado(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff' }}
                      required
                    />
                  </div>

                  <div className="campo-group">
                    <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>Relato de Atividades</label>
                    <textarea
                      rows="6"
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff', resize: 'vertical' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      💾 Guardar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoEdicao(false)}
                      style={{ background: '#555', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {statusMsg && (
                <div style={{ textAlign: 'center', padding: '8px', background: '#222', borderRadius: '6px', border: '1px solid #444', fontSize: '0.9rem' }}>
                  {statusMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoricoDocumentalPage;
