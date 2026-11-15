// src/pages/SelecaoObraPage.jsx
import React, { useState } from 'react';

export function SelecaoObraPage({ onSessaoIniciada }) {
  const [obraSelecionada, setObraSelecionada] = useState('');
  const [setorPavimento, setSetorPavimento] = useState('');
  const [colaboradores, setColaboradores] = useState('');
  const [erro, setErro] = useState('');

  const handleIniciarTurno = (e) => {
    e.preventDefault();
    if (!obraSelecionada) {
      setErro('Por favor, selecione uma obra para continuar.');
      return;
    }

    const sessaoDados = {
      obraId: obraSelecionada,
      obraNome: obraSelecionada,
      setorPavimento: setorPavimento,
      setor: setorPavimento,
      pavimento: setorPavimento,
      colaboradores: colaboradores ? colaboradores.split(',').map(c => c.trim()) : [],
      iniciadoEm: new Date().toISOString()
    };

    localStorage.setItem('obravoz_sessao_ativa', JSON.stringify(sessaoDados));

    if (onSessaoIniciada) {
      onSessaoIniciada(sessaoDados);
    }
  };

  return (
    <div className="card selecao-obra-card">
      
      {/* Cabeçalho */}
      <div className="selecao-obra-header">
        <h2 className="selecao-obra-titulo">
          Configurar Turno
        </h2>
        <p className="selecao-obra-subtitulo">
          Selecione as informações da obra para iniciar o registo
        </p>
      </div>

      {erro && (
        <div className="selecao-erro-msg">
          {erro}
        </div>
      )}

      <form onSubmit={handleIniciarTurno} className="login-form">
        
        {/* 1. Seleção de Obra */}
        <div className="campo-group selecao-campo-group">
          <label className="selecao-label">
            1. QUAL É A OBRA DE HOJE? *
          </label>
          <select
            value={obraSelecionada}
            onChange={(e) => { setObraSelecionada(e.target.value); setErro(''); }}
            className="login-input selecao-select-input"
            required
          >
            <option value="" disabled className="selecao-select-option">-- Selecione uma obra --</option>
            <option value="The Residences Vale do Lobo" className="selecao-select-option">The Residences Vale do Lobo</option>
            <option value="Obra Geral Algarve" className="selecao-select-option">Obra Geral Algarve</option>
            <option value="Edifício Marina Olhão" className="selecao-select-option">Edifício Marina Olhão</option>
          </select>
        </div>

        {/* 2. Setor ou Pavimento */}
        <div className="campo-group selecao-campo-group">
          <label className="selecao-label">
            2. SETOR OU PAVIMENTO
          </label>
          <input
            type="text"
            placeholder="Ex: Bloco A - Laje do 2º Piso"
            value={setorPavimento}
            onChange={(e) => setSetorPavimento(e.target.value)}
            className="login-input selecao-select-input"
          />
        </div>

        {/* 3. Colaboradores Presentes */}
        <div className="campo-group" style={{ marginBottom: '25px' }}>
          <label className="selecao-label">
            3. COLABORADORES PRESENTES
          </label>
          <input
            type="text"
            placeholder="Nome dos colaboradores (ex: Eudes, Albano)"
            value={colaboradores}
            onChange={(e) => setColaboradores(e.target.value)}
            className="login-input selecao-select-input"
          />
        </div>

        {/* Botão de Iniciar */}
        <button
          type="submit"
          className="btn-finalizar"
        >
          Iniciar Registo de Obra
        </button>
      </form>
    </div>
  );
}

export default SelecaoObraPage;
