import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainContent from './MainContent';
import { Login } from './components/Login';
import { SelecaoObraPage } from './pages/SelecaoObraPage';
import { Navbar } from './components/Navbar';
import { NovoDiarioScreen } from './screens/NovoDiarioScreen';
import { HistoricoDiariosScreen } from './pages/HistoricoDiariosScreen';



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


export function App() {
  const [paginaAtual, setPaginaAtual] = useState('selecao');
  const [sessaoAtiva, setSessaoAtiva] = useState(null);

  // Recupera a sessão ativa do localStorage ao carregar a aplicação
  useEffect(() => {
    const sessaoSalva = localStorage.getItem('obravoz_sessao_ativa');
    if (sessaoSalva) {
      try {
        const parsed = JSON.parse(sessaoSalva);
        setSessaoAtiva(parsed);
      } catch (e) {
        console.error('Erro ao ler sessão salva:', e);
      }
    }
  }, []);

  // Callback acionado quando o encarregado confirma o turno na SelecaoObraPage
  const handleSessaoIniciada = (sessao) => {
    setSessaoAtiva(sessao);
    setPaginaAtual('relatos'); // Vai direto para o ecrã de diário após configurar o turno
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', paddingBottom: '50px' }}>
      
      {/* Barra de Navegação Fixa no Topo */}
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
            onDiarioSalvo={() => setPaginaAtual('historico')} // Ao guardar, redireciona para o histórico
          />
        )}

        {paginaAtual === 'historico' && (
          <HistoricoDiariosScreen 
            onSelecionarDiario={(diario) => {
              console.log('Diário selecionado para inspeção:', diario);
              // Aqui poderá abrir um modal ou ecrã de detalhes/PDF no futuro
            }} 
          />
        )}

      </main>
    </div>
  );
}

export default App;

