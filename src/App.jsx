// src/App.jsx
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import SelecaoObraPage from './pages/SelecaoObraPage';
import FormDiario from './components/FormDiario';
import HistoricoDiariosScreen from './pages/HistoricoDiariosScreen';
import PerfilGestaoPage from './pages/PerfilGestaoPage';

export default function App() {
  const { user, loading, logout } = useAuth(); // Puxa o estado de autenticação real e a função logout

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

  // Enquanto o AuthContext verifica se o utilizador está logado, mostra o ecrã de carga
  if (loading) {
    return (
      <div style={{ backgroundColor: '#121212', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>A carregar ObraVoz...</p>
      </div>
    );
  }

  // Se o utilizador não estiver autenticado, exibe obrigatoriamente a tela de Login
  if (!user) {
    return <Login />;
  }

  const handleSessaoIniciada = (dados) => {
    setSessaoAtiva(dados);
    setPaginaAtual('relatos');
  };

  const handleTerminarSessao = () => {
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
    logout(); // Encerra a sessão do utilizador e redireciona de volta para o Login
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

          {sessaoAtiva && (
            <button 
              onClick={handleTerminarSessao}
              title="Terminar turno e sair da conta"
              className="app-btn-sair-turno"
            >
              Terminar Sessão
            </button>
          )}
        </nav>
      </header>

      <main className="app-main-content">
        {paginaAtual === 'selecao' && (
          <SelecaoObraPage onSessaoIniciada={handleSessaoIniciada} />
        )}

        {paginaAtual === 'relatos' && (
          <FormDiario />
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
