import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // <--- Importa a função diretamente
import './App.css';
import { FaMicrophone, FaCamera, FaPaperclip, FaRegFilePdf, FaPlus, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainContent } from './MainContent';
import { Login } from './components/Login';

function Roteador() {
  const { logado, carregando } = useAuth();

  if (carregando) {
    return <div className="loading-screen">Carregando ObraVoz...</div>;
  }

  return logado ? <MainContent /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Roteador />
    </AuthProvider>
  );
}

// --- EXPORT PRINCIPAL COM PROVIDER ---
export default function App() {
  return (
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

function AuthConsumer() {
  const { logado, login } = useAuth(); // Supondo que seu AuthContext tenha esses valores
  // Se não tiver, você pode usar um estado local:
  const [estaLogado, setEstaLogado] = useState(() => localStorage.getItem('app_logado') === 'true');

  const handleLogin = (val) => {
    setEstaLogado(val);
    localStorage.setItem('app_logado', val);
  };

  return estaLogado ? <MainContent /> : <Login onLogin={handleLogin} />;
}
