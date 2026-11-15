// src/App.jsx
import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [etapa, setEtapa] = useState(() => {
    return localStorage.getItem('obravoz_sessao_ativa') ? 'principal' : 'login';
  });

  const [obra, setObra] = useState('');
  const [setor, setSetor] = useState('');

  const handleIniciar = (e) => {
    e.preventDefault();
    if (!obra) return;
    
    const dados = { obraId: obra, setorPavimento: setor };
    localStorage.setItem('obravoz_sessao_ativa', JSON.stringify(dados));
    setEtapa('principal');
  };

  const handleReset = () => {
    localStorage.clear();
    setEtapa('login');
    setObra('');
    setSetor('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#3b82f6', fontSize: '1.4rem', margin: 0 }}>🏗️ ObraVoz - Modo Seguro</h1>
        {etapa === 'principal' && (
          <button 
            onClick={handleReset}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Sair / Reset
          </button>
        )}
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', background: '#1a1a1a', padding: '25px', borderRadius: '8px', border: '1px solid #333' }}>
        {etapa === 'login' ? (
          <form onSubmit={handleIniciar}>
            <h2 style={{ color: '#3b82f6', marginBottom: '15px', fontSize: '1.2rem' }}>Configurar Turno</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Obra:</label>
              <select 
                value={obra} 
                onChange={(e) => setObra(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px' }}
              >
                <option value="" disabled>-- Selecione uma obra --</option>
                <option value="Residencias Vale do Lobo">The Residences Vale do Lobo</option>
                <option value="Obra Geral Algarve">Obra Geral Algarve</option>
                <option value="Edificio Marina Olhao">Edifício Marina Olhão</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Setor / Pavimento:</label>
              <input 
                type="text"
                placeholder="Ex: Bloco A - Piso 2"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '6px' }}
              />
            </div>

            <button 
              type="submit"
              style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
            >
              Iniciar Registo
            </button>
          </form>
        ) : (
          <div>
            <h2 style={{ color: '#4ade80', marginBottom: '10px' }}>✅ Turno Ativo!</h2>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>O sistema está pronto a operar e os dados estão salvos para o PDF.</p>
            <div style={{ background: '#222', padding: '15px', borderRadius: '6px', border: '1px solid #444' }}>
              <p><strong>Obra:</strong> {obra || 'Carregada da Sessão'}</p>
              <p><strong>Setor:</strong> {setor || 'Não especificado'}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
