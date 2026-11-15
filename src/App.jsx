// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { SelecaoObraPage } from './pages/SelecaoObraPage';
import { NovoDiarioScreen } from './screens/NovoDiarioScreen';

export default function App() {
  const [sessaoAtiva, setSessaoAtiva] = useState(() => {
    try {
      const salvo = localStorage.getItem('obravoz_sessao_ativa');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const handleSessaoIniciada = (dados) => {
    setSessaoAtiva(dados);
  };

  const handleLogout = () => {
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', paddingBottom: '40px', fontFamily: 'sans-serif' }}>
      {/* Cabeçalho de Controlo */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
        <h1 style={{ fontSize: '1.2rem', color: '#3b82f6', margin: 0 }}>🏗️ ObraVoz</h1>
        {sessaoAtiva && (
          <button 
            onClick={handleLogout}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
          >
            Mudar Obra / Sair
          </button>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main style={{ maxWidth: '700px', margin: '20px auto', padding: '10px' }}>
        {!sessaoAtiva ? (
          <SelecaoObraPage onSessaoIniciada={handleSessaoIniciada} />
        ) : (
          <NovoDiarioScreen 
            obraId={sessaoAtiva.obraId || sessaoAtiva.obraNome} 
            setorInicial={sessaoAtiva.setorPavimento || ''}
            onDiarioSalvo={() => {
              alert('Diário guardado com sucesso!');
            }} 
          />
        )}
      </main>
    </div>
  );
}
