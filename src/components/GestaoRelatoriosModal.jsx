// src/components/GestaoRelatoriosModal.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../db/db';

export function GestaoRelatoriosModal({ onClose, onEditarDiario }) {
  const [diarios, setDiarios] = useState([]);
  const [diarioSelecionado, setDiarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');

  // Carrega todos os diários salvos (Dexie + localStorage)
  useEffect(() => {
    carregarDiarios();
  }, []);

  const carregarDiarios = async () => {
    try {
      // Tenta buscar do Dexie primeiro
      let listaDexie = [];
      try {
        listaDexie = await db.diarios_obra.toArray();
      } catch (e) {
        console.warn("Dexie indisponível, a usar localStorage");
      }

      // Busca do localStorage como redundância/compatibilidade
      const local = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      
      // Combina e remove duplicados por ID
      const unicosMap = new Map();
      [...listaDexie, ...local].forEach(d => {
        if (d && d.id) unicosMap.set(d.id, d);
      });

      const listaFinal = Array.from(unicosMap.values()).sort((a, b) => 
        new Date(b.data_relatorio || b.criado_em) - new Date(a.data_relatorio || a.criado_em)
      );

      setDiarios(listaFinal);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!diarioSelecionado) return;

    try {
      const atualizado = {
        ...diarioSelecionado,
        atualizado_em: new Date().toISOString(),
        sync_status: 'pending' // Marca novamente como pendente para re-sincronizar se alterado
      };

      // 1. Atualiza no Dexie
      try {
        await db.diarios_obra.put(atualizado);
      } catch (e) {
        console.warn("Erro ao atualizar no Dexie");
      }

      // 2. Atualiza no localStorage
      const local = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      const novoLocal = local.map(d => d.id === atualizado.id ? atualizado : d);
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(novoLocal));

      setMensagem('✅ Relatório atualizado com sucesso!');
      carregarDiarios();
      
      setTimeout(() => {
        setMensagem('');
        setDiarioSelecionado(null);
      }, 1500);

    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      setMensagem('❌ Erro ao atualizar o relatório.');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("Tem certeza de que deseja eliminar este relatório do dispositivo?")) return;

    try {
      try {
        await db.diarios_obra.delete(id);
      } catch (e) {}

      const local = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      const novoLocal = local.filter(d => d.id !== id);
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(novoLocal));

      setDiarioSelecionado(null);
      carregarDiarios();
    } catch (err) {
      console.error("Erro ao eliminar:", err);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#181818', border: '1px solid #333', padding: '20px', borderRadius: '12px' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          <h3 style={{ color: '#2AA1C0', margin: 0, fontSize: '1.2rem' }}>📁 Gestão de Relatórios & PDFs</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {mensagem && (
          <div style={{ padding: '10px', background: 'rgba(42,161,192,0.15)', border: '1px solid #2AA1C0', color: '#5AB3D4', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontSize: '0.85rem' }}>
            {mensagem}
          </div>
        )}

        {/* Ecrã de Edição de um Relatório Específico */}
        {diarioSelecionado ? (
          <form onSubmit={handleSalvarEdicao}>
            <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '1rem' }}>✏️ A editar relatório de: {diarioSelecionado.data_relatorio}</h4>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Setor / Pavimento:</label>
              <input 
                type="text" 
                value={diarioSelecionado.setor_pavimento || ''}
                onChange={e => setDiarioSelecionado({...diarioSelecionado, setor_pavimento: e.target.value})}
                style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Relato de Atividades:</label>
              <textarea 
                rows="4"
                value={diarioSelecionado.relato_atividades || ''}
                onChange={e => setDiarioSelecionado({...diarioSelecionado, relato_atividades: e.target.value})}
                style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Ocorrências / Imprevistos:</label>
              <input 
                type="text" 
                value={diarioSelecionado.ocorrencias || ''}
                onChange={e => setDiarioSelecionado({...diarioSelecionado, ocorrencias: e.target.value})}
                style={{ width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                💾 Guardar Alterações
              </button>
              <button type="button" onClick={() => handleEliminar(diarioSelecionado.id)} style={{ padding: '10px 15px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                🗑️ Eliminar
              </button>
              <button type="button" onClick={() => setDiarioSelecionado(null)} style={{ padding: '10px 15px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Voltar
              </button>
            </div>
          </form>
        ) : (
          /* Lista de Relatórios */
          <div>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '15px' }}>Selecione um relatório para visualizar, alterar ou gerir:</p>
            
            {diarios.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nenhum relatório encontrado no dispositivo.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                {diarios.map(d => (
                  <div 
                    key={d.id}
                    onClick={() => setDiarioSelecionado(d)}
                    style={{ background: '#222', padding: '12px', borderRadius: '8px', border: '1px solid #333', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 'bold', color: '#fff' }}>📅 {d.data_relatorio}</span>
                      <span style={{ color: d.sync_status === 'synced' ? '#2ecc71' : '#f6b93b', fontSize: '0.75rem' }}>
                        {d.sync_status === 'synced' ? '🟢 Sincronizado' : '🟡 Pendente'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                      <strong>Setor:</strong> {d.setor_pavimento || 'Geral'}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#ddd', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {d.relato_atividades || 'Sem relato.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default GestaoRelatoriosModal;
