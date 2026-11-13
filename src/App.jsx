// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { SelecaoObraPage } from './pages/SelecaoObraPage';
import { NovoDiarioScreen } from './screens/NovoDiarioScreen';
import { HistoricoDiariosScreen } from './pages/HistoricoDiariosScreen';

function Roteador() {
  const { logado, carregando } = useAuth();
  const [sessaoAtiva, setSessaoAtiva] = useState(null);

  // Controla a página ativa: 'selecao', 'relatos' ou 'historico'
  const [paginaAtual, setPaginaAtual] = useState(() => {
    const sessao = localStorage.getItem('obravoz_sessao_ativa');
    return sessao ? 'relatos' : 'selecao';
  });

  // Recupera a sessão ativa do localStorage ao carregar
  useEffect(() => {
    const sessaoSalva = localStorage.getItem('obravoz_sessao_ativa');
    if (sessaoSalva) {
      try {
        setSessaoAtiva(JSON.parse(sessaoSalva));
      } catch (e) {
        console.error('Erro ao ler sessão salva:', e);
      }
    }
  }, []);

  if (carregando) {
    return (
      <div className="login-container">
        <div className="login-box" style={{ color: 'var(--blue-light)' }}>
          🚩 A carregar ObraVoz...
        </div>
      </div>
    );
  }

  if (!logado) {
    return <Login />;
  }

  const handleSessaoIniciada = (sessao) => {
    setSessaoAtiva(sessao);
    setPaginaAtual('relatos');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', paddingBottom: '60px' }}>
      {/* Barra de Navegação Superior */}
      <Navbar paginaAtual={paginaAtual} setPaginaAtual={setPaginaAtual} />

      {/* Conteúdo Principal Alternado por Estado */}
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '10px' }}>
        {paginaAtual === 'selecao' && (
          <SelecaoObraPage onSessaoIniciada={handleSessaoIniciada} />
        )}

        {paginaAtual === 'relatos' && (
          <NovoDiarioScreen 
            obraId={sessaoAtiva?.obraId || 'geral'} 
            setorInicial={sessaoAtiva?.setorPavimento || ''}
            onDiarioSalvo={() => setPaginaAtual('historico')} 
          />
        )}

        {paginaAtual === 'historico' && (
          <HistoricoDiariosScreen 
            onSelecionarDiario={(diario) => {
              console.log('Diário selecionado para inspeção:', diario);
            }} 
          />
        )}
      </main>
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
