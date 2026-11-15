// src/App.jsx
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import SelecaoObraPage from './pages/SelecaoObraPage';
import NovoDiarioScreen from './screens/NovoDiarioScreen';
import HistoricoDiariosScreen from './pages/HistoricoDiariosScreen';
import PerfilGestaoPage from './pages/PerfilGestaoPage';

export default function App() {
  // 1. PRIMEIRO: Declaração de todos os Hooks obrigatórios do React (sem exceção)
  const { user, loading, logout } = useAuth();

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

  // 2. SEGUNDO: Condicionais de carregamento e autenticação (após todos os hooks)
  if (loading) {
    return (
      <div style={{ backgroundColor: '#121212', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>A carregar ObraVoz...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleSessaoIniciada = (dados) => {
    setSessaoAtiva(dados);
    setPaginaAtual('relatos');
  };

  // Função chamada APÓS o diário ser guardado com sucesso na NovoDiarioScreen
  const handleDiarioSalvoComSucesso = (dadosDiario) => {
    console.log('Diário guardado com sucesso:', dadosDiario);
    
    // SÓ AQUI limpamos os dados do turno/sessão ativa do localStorage e do estado
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
    
    // Opcional: Redireciona para o histórico ou mantém na tela limpa para novo turno
    // setPaginaAtual('historico');
  };

  const handleTerminarSessao = () => {
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
    logout();
  };

  return (
    <div className="app-root-container">
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

          <button 
            onClick={handleTerminarSessao}
            title="Terminar sessão e sair da conta"
            className="app-btn-sair-turno"
          >
            Sair
          </button>
        </nav>
      </header>

      <main className="app-main-content">
        {paginaAtual === 'selecao' && (
          <SelecaoObraPage onSessaoIniciada={handleSessaoIniciada} />
        )}

        {paginaAtual === 'relatos' && (
          <NovoDiarioScreen 
            obraId={sessaoAtiva?.obraId || 'geral'} 
            userId={user?.id || null}
            onDiarioSalvo={handleDiarioSalvoComSucesso}
          />
        )}

        {paginaAtual === 'historico' && (
          <HistoricoDiariosScreen 
            onSelecionarDiario={(diario) => {
              console.log('Diário selecionado:', diario);
            }} 
          />
        )}

        {paginaAtual === 'perfil' && (
          <PerfilGestaoPage />
        )}
      </main>
    </div>
  );
}
