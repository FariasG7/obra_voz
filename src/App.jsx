import React from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainContent from './MainContent';
import { Login } from './components/Login';
import { SelecaoObraPage } from './pages/SelecaoObraPage';

function Roteador() {
  const { logado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="login-container">
        <div className="login-box" style={{ color: 'var(--blue-light)' }}>
          🏗️ Carregando ObraVoz...
        </div>
      </div>
    );
  }

  return logado ? <SelecaoObraPage /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Roteador />
    </AuthProvider>
  );
}
