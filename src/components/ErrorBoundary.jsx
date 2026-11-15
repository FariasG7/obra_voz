import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 30, color: '#fff', backgroundColor: '#121212', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ color: '#FF3B30' }}>⚠️ Ocorreu um erro na aplicação</h2>
          <p style={{ marginTop: 10, color: '#aaa' }}>{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
