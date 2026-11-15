// src/main.jsx (ou src/index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './App.css';

// Componente de segurança de último nível para capturar erros críticos de script
class RootErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Erro crítico no arranque:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#1a1a1a', color: '#ff6b6b', fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
          <h2>⚠️ O ObraVoz encontrou um bloqueio ao carregar.</h2>
          <p style={{ color: '#ccc', margin: '15px 0' }}>{this.state.error?.toString()}</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Limpar Cache e Reiniciar Aplicação
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </React.StrictMode>
  );
} catch (err) {
  console.error("Falha fatal no render root:", err);
  document.body.innerHTML = `
    <div style="padding: 30px; background: #1a1a1a; color: #ff6b6b; font-family: sans-serif; text-align: center;">
      <h2>🚨 Erro Crítico de Arranque</h2>
      <pre>${err.message}</pre>
      <button onclick="localStorage.clear(); window.location.reload();" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer;">Limpar Dados e Recarregar</button>
    </div>
  `;
}
