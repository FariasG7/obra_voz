// src/App.jsx
import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [sessaoAtiva, setSessaoAtiva] = useState(() => {
    try {
      const salvo = localStorage.getItem('obravoz_sessao_ativa');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [obraSelecionada, setObraSelecionada] = useState('Residencias Vale do Lobo');
  const [setorPavimento, setSetorPavimento] = useState('');
  const [relato, setRelato] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleIniciarTurno = (e) => {
    e.preventDefault();
    const dados = { obraId: obraSelecionada, setorPavimento };
    localStorage.setItem('obravoz_sessao_ativa', JSON.stringify(dados));
    setSessaoAtiva(dados);
  };

  const handleLogout = () => {
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
    setSetorPavimento('');
    setRelato('');
  };

  const handleSalvarDiario = (e) => {
    e.preventDefault();
    setMensagem('✅ Diário guardado com sucesso no dispositivo!');
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Cabeçalho */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #333', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '1.2rem', color: '#3b82f6', margin: 0 }}>🏗️ ObraVoz</h1>
        {sessaoAtiva && (
          <button 
            onClick={handleLogout}
            style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Mudar Obra / Turno
          </button>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main style={{ maxWidth: '600px', margin: '0 auto', background: '#1a1a1a', padding: '25px', borderRadius: '8px', border: '1px solid #333' }}>
        {!sessaoAtiva ? (
          <form onSubmit={handleIniciarTurno}>
            <h2 style={{ color: '#3b82f6', marginBottom: '15px', fontSize: '1.3rem' }}>Selecionar Obra e Turno</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Obra:</label>
              <select 
                value={obraSelecionada}
                onChange={(e) => setObraSelecionada(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px' }}
              >
                <option value="Residencias Vale do Lobo">The Residences Vale do Lobo</option>
                <option value="Obra Geral Algarve">Obra Geral Algarve</option>
                <option value="Edificio Marina Olhao">Edifício Marina Olhão</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Setor / Pavimento Inicial:</label>
              <input 
                type="text"
                placeholder="Ex: Bloco A - Piso 2"
                value={setorPavimento}
                onChange={(e) => setSetorPavimento(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px' }}
              />
            </div>

            <button 
              type="submit"
              style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
            >
              Iniciar Turno
            </button>
          </form>
        ) : (
          <form onSubmit={handleSalvarDiario}>
            <h2 style={{ color: '#4ade80', marginBottom: '5px', fontSize: '1.3rem' }}>Registo Diário de Obra</h2>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
              Obra: <strong style={{ color: '#fff' }}>{sessaoAtiva.obraId}</strong> | Setor: <strong style={{ color: '#fff' }}>{sessaoAtiva.setorPavimento}</strong>
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Relato dos Trabalhos:</label>
              <textarea 
                rows="5"
                placeholder="Descreva o andamento dos trabalhos..."
                value={relato}
                onChange={(e) => setRelato(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit"
              style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
            >
              💾 Guardar Diário Offline
            </button>

            {mensagem && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#14532d', color: '#bbf7d0', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem' }}>
                {mensagem}
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
