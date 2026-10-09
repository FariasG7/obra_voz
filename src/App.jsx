import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainContent from './MainContent';
import { Login } from './components/Login';
import { SelecaoObraPage } from './pages/SelecaoObraPage';

function Roteador() {
  const { logado, carregando } = useAuth();

  // Estado para verificar se a sessão de obra já foi configurada
  const [sessaoAtiva, setSessaoAtiva] = useState(() => {
    return localStorage.getItem('obravoz_sessao_ativa');
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

  // Se não estiver logado, mostra o Login
  if (!logado) {
    return <Login />;
  }

  // Se estiver logado mas ainda não escolheu a obra/turno, mostra a página de seleção
  if (!sessaoAtiva) {
    return (
      <SelecaoObraPage 
        onSessaoIniciada={(novaSessao) => {
          setSessaoAtiva(novaSessao);
        }} 
      />
    );
  }

  // Se estiver logado e com a sessão ativa, mostra o conteúdo principal (Relatos / Diário)
  return <MainContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <Roteador />
    </AuthProvider>
  );
}
