// src/pages/SelecaoObraPage.jsx
import React, { useState } from 'react';
import '../App.css';

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

    // Estrutura completa guardada para alimentar o cabeçalho do PDF e relatórios
    const sessaoDados = {
      obraId: obraSelecionada,
      obraNome: obraSelecionada, // Ajuste se tiver a lista com o nome real
      setorPavimento: setorPavimento,
      setor: setorPavimento,
      pavimento: setorPavimento,
      colaboradores: colaboradores,
      iniciadoEm: new Date().toISOString()
    };

    // Salva no localStorage para persistir na sessão ativa
    localStorage.setItem('obravoz_sessao_ativa', JSON.stringify(sessaoDados));

    if (onSessaoIniciada) {
      onSessaoIniciada(sessaoDados);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '650px', margin: '30px auto', padding: '30px' }}>
      
      {/* Título posicionado corretamente no topo seguindo o padrão */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: 'var(--blue-primary, #3b82f6)', marginBottom: '6px', fontSize: '1.5rem' }}>
          Configurar Turno
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Selecione as informações da obra para iniciar o registo
        </p>
      </div>

      {erro && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#7f1d1d', color: '#fca5a5', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem' }}>
          {erro}
        </div>
      )}

      <form onSubmit={handleIniciarTurno} className="login-form">
        
        {/* 1. Seleção de Obra (Caixa dimensionada corretamente com a classe login-input) */}
        <div className="campo-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ddd', fontWeight: 'bold' }}>
            1. QUAL É A OBRA DE HOJE? *
          </label>
          <select
            value={obraSelecionada}
            onChange={(e) => { setObraSelecionada(e.target.value); setErro(''); }}
            className="login-input"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#1a1a1a', color: '#fff', border: '1px solid #555', fontSize: '1rem' }}
            required
          >
            <option value="" disabled>-- Selecione uma obra --</option>
            <option value="Residencias Vale do Lobo">The Residences Vale do Lobo</option>
            <option value="Obra Geral Algarve">Obra Geral Algarve</option>
            <option value="Edificio Marina Olhao">Edifício Marina Olhão</option>
          </select>
        </div>

        {/* 2. Setor ou Pavimento */}
        <div className="campo-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ddd', fontWeight: 'bold' }}>
            2. SETOR OU PAVIMENTO
          </label>
          <input
            type="text"
            placeholder="Ex: Bloco A - Laje do 2º Piso"
            value={setorPavimento}
            onChange={(e) => setSetorPavimento(e.target.value)}
            className="login-input"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#1a1a1a', color: '#fff', border: '1px solid #555', fontSize: '1rem' }}
          />
        </div>

        {/* 3. Colaboradores Presentes */}
        <div className="campo-group" style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ddd', fontWeight: 'bold' }}>
            3. COLABORADORES PRESENTES
          </label>
          <input
            type="text"
            placeholder="Nome dos colaboradores (ex: Eudes, Albano)"
            value={colaboradores}
            onChange={(e) => setColaboradores(e.target.value)}
            className="login-input"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#1a1a1a', color: '#fff', border: '1px solid #555', fontSize: '1rem' }}
          />
        </div>

        {/* Botão de Iniciar */}
        <button
          type="submit"
          className="btn-finalizar"
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--blue-primary, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Iniciar Registo de Obra
        </button>
      </form>
    </div>
  );
}

export default SelecaoObraPage;
