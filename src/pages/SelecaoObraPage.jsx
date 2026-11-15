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

    const listaColaboradores = colaboradores
      ? colaboradores.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    const sessaoDados = {
      obraId: obraSelecionada,
      nomeObra: obraSelecionada,
      obraNome: obraSelecionada,
      setorPavimento: setorPavimento,
      setor: setorPavimento,
      pavimento: setorPavimento,
      colaboradores: listaColaboradores,
      iniciadoEm: new Date().toISOString()
    };

    localStorage.setItem('obravoz_sessao_ativa', JSON.stringify(sessaoDados));

    if (onSessaoIniciada) {
      onSessaoIniciada(sessaoDados);
    }
  };

  return (
    <div className="card selecao-obra-card">
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

        <div className="campo-group selecao-campo-group-ultimo">
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
