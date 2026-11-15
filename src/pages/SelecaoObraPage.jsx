// src/pages/SelecaoObraPage.jsx (Exemplo estrutural padronizado)
import React, { useState } from 'react';

export default function SelecaoObraPage({ onSessaoIniciada }) {
  const sessaoSalva=JSON.parse(localStorage.getItem('obravoz_sessao_ativa') || 'null');
  
  const [obraId, setObraId] = useState(sessaoSalva?.obraId || '');
  const [setorPavimento, setSetorPavimento] = useState(sessaoSalva?.setorPavimento || '');
  const [colaboradores, setColaboradores] = useState(
    sessaoSalva?.colaboradores ? sessaoSalva.colaboradores.join(', ') : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!obraId) {
      alert('Selecione uma obra.');
      return;
    }

    const dadosSessao = {
      obraId,
      obraNome: obraId,
      setorPavimento,
      colaboradores: colaboradores ? colaboradores.split(',').map(c => c.trim()) : []
    };

    localStorage.setItem('obravoz_sessao_ativa', JSON.stringify(dadosSessao));
    onSessaoIniciada(dadosSessao);
  };

  return (
    <div className="content diario-content-wrapper">
      <div className="card diario-form-card">
        <h2 className="diario-sessao-titulo">Configurar Turno</h2>
        <p className="login-subtitulo" style={{ textAlign: 'left', marginBottom: '10px' }}>
          Selecione as informações da obra para iniciar o registo
        </p>

        <form onSubmit={handleSubmit}>
          <div className="campo-group">
            <label>1. Qual é a obra de hoje? *</label>
            <select 
              value={obraId} 
              onChange={(e) => setObraId(e.target.value)}
              required
            >
              <option value="">-- Selecione uma obra --</option>
              <option value="The Residences Vale do Lobo">The Residences – Vale do Lobo</option>
              <option value="Vilamoura Plaza">Vilamoura Plaza</option>
              <option value="Quarteira Mar">Quarteira Mar</option>
            </select>
          </div>

          <div className="campo-group">
            <label>2. Setor ou Pavimento</label>
            <input 
              type="text"
              value={setorPavimento}
              onChange={(e) => setSetorPavimento(e.target.value)}
              placeholder="Ex: Bloco A - Laje do 2º Piso"
            />
          </div>

          <div className="campo-group">
            <label>3. Colaboradores Presentes</label>
            <input 
              type="text"
              value={colaboradores}
              onChange={(e) => setColaboradores(e.target.value)}
              placeholder="Nome dos colaboradores (ex: Eudes, Albano)"
            />
          </div>

          <button type="submit" className="btn-guardar-diario">
            Iniciar Registo de Obra
          </button>
        </form>
      </div>
    </div>
  );
}
