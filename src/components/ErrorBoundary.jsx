// src/components/ErrorBoundary.jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Erro capturado pela ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#121212', color: '#ff6b81', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>⚠️ Erro detetado na aplicação:</h2>
          <pre style={{ background: '#1e1e1e', padding: '15px', borderRadius: '8px', overflowX: 'auto', marginTop: '10px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <h3 style={{ marginTop: '20px', color: '#fff' }}>Detalhes:</h3>
          <pre style={{ background: '#1e1e1e', padding: '15px', borderRadius: '8px', overflowX: 'auto', marginTop: '10px', fontSize: '0.8rem', color: '#aaa' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#2AA1C0', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Limpar Dados (LocalStorage) & Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
