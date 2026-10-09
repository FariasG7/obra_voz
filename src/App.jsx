import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainContent from './MainContent';
import { Login } from './components/Login';
import { SelecaoObraPage } from './pages/SelecaoObraPage';
import { Navbar } from './components/Navbar';

function Roteador() {
  const { logado, carregando } = useAuth();

  // Controla a página ativa: 'selecao' ou 'relatos'
  const [paginaAtual, setPaginaAtual] = useState(() => {
    const sessao = localStorage.getItem('obravoz_sessao_ativa');
    return sessao ? 'relatos' : 'selecao';
  });

  if (carregando) {
    return (
      <div className="login-container">
        <div className="login-box" style={{ color: 'var(--blue-light)' }}>
          🚩 Carregando ObraVoz...
        </div>
      </div>
    );
  }

  if (!logado) {
    return <Login />;
  }

  return (
    <div className="container">
      {/* Barra de Navegação Superior */}
      <Navbar paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />

      {/* Renderização condicional baseada na aba ativa */}
      <div style={{ marginTop: '10px' }}>
        {paginaAtual === 'selecao' ? (
          <SelecaoObraPage 
            onSessaoIniciada={() => setPaginaAtual('relatos')} 
          />
        ) : (
          <MainContent />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Roteador />
    </AuthProvider>
  );
}
