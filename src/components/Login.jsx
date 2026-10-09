import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [submetendo, setSubmetendo] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSubmetendo(true);

    const resultado = await login(email, senha);
    if (!resultado.sucesso) {
      setErro(resultado.erro || 'Erro ao efetuar login.');
    }
    setSubmetendo(false);
  };

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
      </div>
    </div>
  );
}
