/**

// src/App.jsx
import React, { useState } from 'react';
import SelecaoObraPage from './pages/SelecaoObraPage';
import FormDiario from './components/FormDiario';
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
    <div className="app-root-container">
      
      {/* Navbar Superior Completa */}
      <header className="app-navbar-header">
        <div className="app-navbar-brand-wrapper">
          <h1 className="app-navbar-titulo">
            <span className="logo-obra">Obra</span><span className="logo-voz">Voz</span>
          </h1>
          {sessaoAtiva && (
            <span className="app-navbar-badge-obra">
              📍 {sessaoAtiva.obraId || sessaoAtiva.obraNome}
            </span>
          )}
        </div>

        {/* Abas de Navegação */}
        <nav className="app-navbar-menu">
          <button
            onClick={() => setPaginaAtual('selecao')}
            className={`app-nav-btn ${paginaAtual === 'selecao' ? 'ativo' : ''}`}
          >
            Turno / Obra
          </button>

          <button
            onClick={() => setPaginaAtual('relatos')}
            className={`app-nav-btn ${paginaAtual === 'relatos' ? 'ativo' : ''}`}
          >
            Relatos (Diário)
          </button>

          <button
            onClick={() => setPaginaAtual('historico')}
            className={`app-nav-btn ${paginaAtual === 'historico' ? 'ativo' : ''}`}
          >
            Histórico
          </button>

          <button
            onClick={() => setPaginaAtual('perfil')}
            className={`app-nav-btn ${paginaAtual === 'perfil' ? 'ativo' : ''}`}
          >
            Perfil
          </button>

          {sessaoAtiva && (
            <button 
              onClick={handleMudarObra}
              title="Terminar turno atual"
              className="app-btn-sair-turno"
            >
              Sair
            </button>
          )}
        </nav>
      </header>

      {/* Conteúdo Dinâmico Baseado na Aba Selecionada */}
      <main className="app-main-content">
        {paginaAtual === 'selecao' && (
          <SelecaoObraPage onSessaoIniciada={handleSessaoIniciada} />
        )}

        {paginaAtual === 'relatos' && (
          <FormDiario />
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

-*/
// src/App.jsx (Versão de Diagnóstico Mínima)
import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '40px', background: '#121212', color: '#fff', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2AA1C0' }}>🏗️ ObraVoz - Diagnóstico</h1>
      <p style={{ marginTop: '15px', color: '#ccc' }}>O PWA está online e a carregar corretamente!</p>
    </div>
  );
}
