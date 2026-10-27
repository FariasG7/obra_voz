import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cadastro } from './Cadastro';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
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
      setSubmetendo(false); // Garante que o botão destrava sempre
    }
  };


  // Se o utilizador clicou para se cadastrar, mostra o componente de Cadastro
  if (mostrandoCadastro) {
    return <Cadastro aoVoltarAoLogin={() => setMostrandoCadastro(false)} />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🏗️ ObraVoz</h1>
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
            <input 
              className="login-input" 
              type="password" 
              placeholder="••••••••" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-login" disabled={submetendo}>
            {submetendo ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button 
            type="button"
            onClick={() => setMostrandoCadastro(true)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--blue-primary, #007AFF)', 
              cursor: 'pointer', 
              fontSize: '0.9rem',
              textDecoration: 'underline' 
            }}
          >
            Não tem conta? Cadastrar novo utilizador
          </button>
        </div>
      </div>
    </div>
  );
}
