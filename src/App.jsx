// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import SelecaoObraPage from './pages/SelecaoObraPage';
import NovoDiarioScreen from './screens/NovoDiarioScreen';
import HistoricoDiariosScreen from './pages/HistoricoDiariosScreen';
import PerfilGestaoPage from './pages/PerfilGestaoPage';

export default function App() {
  const [sessaoAtiva, setSessaoAtiva] = useState(() => {
    try {
      const salvo = localStorage.getItem('obravoz_sessao_ativa');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  // Controla qual aba está ativa na navbar: 'selecao', 'relatos', 'historico', 'perfil'
  const [paginaAtual, setPaginaAtual] = useState(() => {
    return localStorage.getItem('obravoz_sessao_ativa') ? 'relatos' : 'selecao';
  });

  const handleSessaoIniciada = (dados) => {
    setSessaoAtiva(dados);
    setPaginaAtual('relatos');
  };

  const handleMudarObra = () => {
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
    setPaginaAtual('selecao');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', paddingBottom: '50px', fontFamily: 'sans-serif' }}>
      
      {/* Navbar Superior Completa */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 20px', 
        borderBottom: '1px solid #333', 
        background: '#1a1a1a',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '1.2rem', color: '#3b82f6', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏗️ ObraVoz
          </h1>
          {sessaoAtiva && (
            <span style={{ fontSize: '0.8rem', color: '#888', background: '#222', padding: '4px 8px', borderRadius: '4px', border: '1px solid #333' }}>
              📍 {sessaoAtiva.obraId || sessaoAtiva.obraNome}
            </span>
          )}
        </div>

        {/* Abas de Navegação */}
        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPaginaAtual('selecao')}
            style={{
              background: paginaAtual === 'selecao' ? '#2563eb' : '#222',
              color: '#fff',
              border: '1px solid #444',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: paginaAtual === 'selecao' ? 'bold' : 'normal'
            }}
          >
            Turno / Obra
          </button>

          <button
            onClick={() => setPaginaAtual('relatos')}
            style={{
              background: paginaAtual === 'relatos' ? '#2563eb' : '#222',
              color: '#fff',
              border: '1px solid #444',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: paginaAtual === 'relatos' ? 'bold' : 'normal'
            }}
          >
            Relatos (Diário)
          </button>

          <button
            onClick={() => setPaginaAtual('historico')}
            style={{
              background: paginaAtual === 'historico' ? '#2563eb' : '#222',
              color: '#fff',
              border: '1px solid #444',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: paginaAtual === 'historico' ? 'bold' : 'normal'
            }}
          >
            Histórico
          </button>

          <button
            onClick={() => setPaginaAtual('perfil')}
            style={{
              background: paginaAtual === 'perfil' ? '#2563eb' : '#222',
              color: '#fff',
              border: '1px solid #444',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: paginaAtual === 'perfil' ? 'bold' : 'normal'
            }}
          >
            Perfil
          </button>

          {sessaoAtiva && (
            <button 
              onClick={handleMudarObra}
              title="Terminar turno atual"
              style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Sair
            </button>
          )}
        </nav>
      </header>

      {/* Conteúdo Dinâmico Baseado na Aba Selecionada */}
      <main style={{ maxWidth: '700px', margin: '20px auto', padding: '10px' }}>
        {paginaAtual === 'selecao' && (
          <SelecaoObraPage onSessaoIniciada={handleSessaoIniciada} />
        )}

        {paginaAtual === 'relatos' && (
          <NovoDiarioScreen 
            obraId={sessaoAtiva?.obraId || sessaoAtiva?.obraNome || 'geral'} 
            userId={null}
            onDiarioSalvo={() => setPaginaAtual('historico')} 
          />
        )}

        {paginaAtual === 'historico' && (
          <HistoricoDiariosScreen 
            onSelecionarDiario={(diario) => console.log('Diário selecionado:', diario)} 
          />
        )}

        {paginaAtual === 'perfil' && (
          <PerfilGestaoPage />
        )}
      </main>
    </div>
  );
}
