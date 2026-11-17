// src/App.jsx
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import CadastroUsuario from './pages/CadastroUsuario'; // Certifique-se de importar o ecrã de cadastro se já o tiver
import Navbar from './components/Navbar';
import SelecaoObraPage from './pages/SelecaoObraPage';
import NovoDiarioScreen from './screens/NovoDiarioScreen';
import HistoricoDiariosScreen from './pages/HistoricoDiariosScreen';
import PerfilGestaoPage from './pages/PerfilGestaoPage';

export default function App() {
  // 1. PRIMEIRO: Declaração de todos os Hooks obrigatórios do React
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

  // 2. SEGUNDO: Condicionais de carregamento
  if (loading) {
    return (
      <div style={{ backgroundColor: '#121212', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>A carregar ObraVoz...</p>
      </div>
    );
  }

  // Se o utilizador não estiver autenticado
  if (!user) {
    
    if (paginaAtual === 'cadastro') {
      return <CadastroUsuario onVoltarLogin={() => setPaginaAtual('login')} />;
    }
    return <Login onIrParaCadastro={() => setPaginaAtual('cadastro')} />;
  }

  const handleSessaoIniciada = (dados) => {
    setSessaoAtiva(dados);
    setPaginaAtual('relatos');
  };

  // Função chamada APÓS o diário ser guardado com sucesso
  const handleDiarioSalvoComSucesso = (dadosDiario) => {
    console.log('Diário guardado com sucesso:', dadosDiario);
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
  };

  const handleTerminarSessao = () => {
    localStorage.removeItem('obravoz_sessao_ativa');
    setSessaoAtiva(null);
    logout();
  };

  return (
    <div className="app-root-container">
      {/* Nova Navbar Unificada (Clima + Obra Ativa + Menu + Logout) */}
      <Navbar 
        paginaAtual={paginaAtual} 
        setPaginaAtual={setPaginaAtual} 
        obraSelecionada={sessaoAtiva?.obraNome || sessaoAtiva?.obraId || null} 
        onLogout={handleTerminarSessao} 
      />

      <main className="app-main-content" style={{ padding: '20px' }}>
        {paginaAtual === 'selecao' && (
          <SelecaoObraPage onSessaoIniciada={handleSessaoIniciada} />
        )}

        {paginaAtual === 'relatos' && (
          <NovoDiarioScreen 
            obraId={sessaoAtiva?.obraId || 'geral'} 
            userId={user?.id || null}
            dadosTurno={sessaoAtiva}
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
