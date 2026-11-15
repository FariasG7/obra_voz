import React, { useState } from 'react';
import { autenticarUtilizador } from '../services/authService'; // ou o caminho correto do seu serviço
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Função do contexto que guarda o utilizador no estado e localStorage

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // 1. Valida com a função robusta que partilhou (Neon + Dexie fallback)
      const res = await autenticarUtilizador(email, senha);

      if (res.sucesso) {
        // 2. Guarda o utilizador no AuthContext da aplicação
        await login(res.usuario); 
      } else {
        setErro(res.erro || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setErro('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1><span className="logo-obra">Obra</span><span className="logo-voz">Voz</span></h1>
        <p className="login-subtitulo">Diário de Obra Inteligente</p>

        {erro && <div className="login-erro">{erro}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="campo-group">
            <label>E-mail</label>
            <input 
              type="email" 
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required 
            />
          </div>

          <div className="campo-group">
            <label>Senha</label>
            <div className="password-wrapper">
              <input 
                type="password" 
                className="login-input password-input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="********"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
