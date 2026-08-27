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