// src/pages/HistoricoDocumentalPage.jsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function HistoricoDocumentalPage() {
  const diarios = useLiveQuery(() => db.diarios_obra.orderBy('data_relatorio').reverse().toArray(), []);

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [diarioSelecionado, setDiarioSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [textoEditado, setTextoEditado] = useState('');
  const [setorEditado, setSetorEditado] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [sincronizando, setSincronizando] = useState(false);

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
        synced: 0
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
    <div className="content historico-doc-wrapper">
      
      {/* Cabeçalho */}
      <div className="historico-doc-header">
        <div>
          <h2 className="historico-doc-titulo">
            📚 Histórico Documental
          </h2>
          <p className="historico-doc-subtitulo">
            Consulta, pesquisa e edição de RDOs guardados no dispositivo
          </p>
        </div>

        <button
          onClick={handleForcarSync}
          disabled={sincronizando}
          className="btn-forcar-sync"
        >
          {sincronizando ? '🔄 A enviar...' : '☁️ Sincronizar'}
        </button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="card historico-doc-filtros">
        <input
          type="text"
          placeholder="🔍 Pesquisar por setor, texto ou data..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="historico-input-busca"
        />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="historico-select-status"
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
        <div className="card historico-vazio-card">
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📭 Nenhum RDO encontrado.</p>
          <p style={{ fontSize: '0.85rem' }}>Tente ajustar os termos de pesquisa ou filtros.</p>
        </div>
      ) : (
        <div className="historico-lista">
          {diariosFiltrados.map((diario) => {
            const isPendente = diario.synced === 0 || diario.sync_status === 'pending';

            return (
              <div
                key={diario.id}
                className="card historico-doc-item"
                onClick={() => abrirDetalhes(diario)}
              >
                <div className="historico-item-header">
                  <span className="historico-item-data">
                    📅 {diario.data_relatorio || diario.data}
                  </span>
                  <span className={isPendente ? 'historico-badge-pendente' : 'historico-badge-sincronizado'}>
                    {isPendente ? '🟡 Pendente' : '🟢 Sincronizado'}
                  </span>
                </div>

                <div className="historico-item-detalhes">
                  <strong>Setor:</strong> {diario.setor_pavimento || 'Geral'} | <strong>Clima:</strong> {diario.clima || 'Não registado'}
                </div>

                <p className="historico-item-relato">
                  {diario.textoRelato || diario.relato_atividades || 'Sem relato preenchido.'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALHES E EDIÇÃO */}
      {diarioSelecionado && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Header Modal */}
            <div className="modal-header">
              <h3 className="modal-titulo">
                {modoEdicao ? '✏️ Editar RDO' : '🔍 Detalhes do RDO'}
              </h3>
              <button onClick={fecharModal} className="modal-btn-fechar">✕</button>
            </div>

            {/* Corpo Modal */}
            <div className="modal-body">
              <div>
                <span className="modal-label-campo">Data do Registo</span>
                <p className="modal-valor-campo">{diarioSelecionado.data_relatorio || diarioSelecionado.data}</p>
              </div>

              {!modoEdicao ? (
                <>
                  <div>
                    <span className="modal-label-campo">Setor / Pavimento</span>
                    <p className="modal-valor-campo">{diarioSelecionado.setor_pavimento || 'Não especificado'}</p>
                  </div>

                  <div>
                    <span className="modal-label-campo">Condição Atmosférica</span>
                    <p className="modal-valor-campo">{diarioSelecionado.clima || 'Não registado'}</p>
                  </div>

                  <div>
                    <span className="modal-label-campo">Relato de Atividades</span>
                    <p className="modal-texto-relato">
                      {diarioSelecionado.textoRelato || diarioSelecionado.relato_atividades || 'Sem relato.'}
                    </p>
                  </div>

                  {diarioSelecionado.fotosBase64 && diarioSelecionado.fotosBase64.length > 0 && (
                    <div>
                      <span className="modal-label-campo">Registo Fotográfico ({diarioSelecionado.fotosBase64.length})</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {diarioSelecionado.fotosBase64.map((foto, idx) => (
                          <img key={idx} src={foto} alt={`Foto ${idx}`} className="modal-foto-preview" />
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setModoEdicao(true)}
                    className="btn-guardar-diario"
                    style={{ marginTop: '10px' }}
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
                      className="login-input"
                      required
                    />
                  </div>

                  <div className="campo-group">
                    <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>Relato de Atividades</label>
                    <textarea
                      rows="6"
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      className="modal-textarea-edicao"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      className="btn-guardar-alteracoes"
                    >
                      💾 Guardar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoEdicao(false)}
                      className="btn-cancelar-edicao"
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
