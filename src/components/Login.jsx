// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cadastro } from './Cadastro';



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
      return <div style={{ padding: 20, color: 'red' }}>Ocorreu um erro: {this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [submetendo, setSubmetendo] = useState(false);
  const [mostrandoCadastro, setMostrandoCadastro] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSubmetendo(true);

    try {
      const resultado = await login(email, senha);
      if (!resultado.sucesso) {
        setErro(resultado.erro || 'Erro ao efetuar login.');
      }
    } catch (err) {
      setErro('Ocorreu um erro inesperado.');
    } finally {
      setSubmetendo(false);
    }
  };

  const revelarSenha = () => setMostrarSenha(true);
  const ocultarSenha = () => setMostrarSenha(false);

  if (mostrandoCadastro) {
    return <Cadastro aoVoltarAoLogin={() => setMostrandoCadastro(false)} />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>
          🏗️ <span className="logo-obra">Obra</span><span className="logo-voz">Voz</span>
        </h1>
        <p className="login-subtitulo">Diário de Obra Inteligente</p>
        
        {erro && <div className="login-erro">{erro}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="campo-group">
            <label>E-mail</label>
            <input 
              className="login-input" 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="campo-group">
            <label>Senha</label>
            <div className="password-wrapper">
              <input 
                className="login-input password-input" 
                type={mostrarSenha ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                required 
              />
              <button
                type="button"
                onPointerDown={revelarSenha}
                onPointerUp={ocultarSenha}
                onPointerLeave={ocultarSenha}
                onPointerCancel={ocultarSenha}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Segure para visualizar a senha"
                title="Segure para ver a senha"
                className="password-toggle-btn"
              >
                {mostrarSenha ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={submetendo}>
            {submetendo ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-cadastro-container">
          <button 
            type="button"
            onClick={() => setMostrandoCadastro(true)}
            className="btn-link-cadastro"
          >
            Não tem conta? Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
