// src/components/Login.jsx
import React, { useState } from 'react';
import { autenticarUtilizador } from '../services/authService';
import { useAuth } from '../context/AuthContext';

// Exemplo de como deve estar estruturado o seu src/services/authService.js
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL, { disableWarningInBrowsers: true });

export async function autenticarUtilizador(email, senha) {
  try {
    // Busca o usuário no Neon filtrando pelo e-mail
    const resultado = await sql`SELECT * FROM users WHERE email = ${email}`;

    // Valida se a consulta retornou algum registro
    if (!resultado || resultado.length === 0) {
      return { sucesso: false, erro: 'Utilizador não encontrado. Verifique os dados ou cadastre-se.' };
    }

    const usuario = resultado[0];

    // Valida a senha (ajuste 'senha' ou 'password' conforme o nome da coluna na sua tabela)
    if (usuario.senha !== senha) {
      return { sucesso: false, erro: 'Senha incorreta.' };
    }

    return { 
      sucesso: true, 
      usuario: { 
        id: usuario.id, 
        email: usuario.email, 
        nome: usuario.nome || 'Guilherme' 
      } 
    };

  } catch (err) {
    console.error('Erro no serviço de autenticação:', err);
    return { sucesso: false, erro: 'Erro de conexão com o banco de dados.' };
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const res = await autenticarUtilizador(email, password);

      if (res && res.sucesso) {
        await login(res.usuario);
      } else {
        setErro(res?.erro || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error('Erro detalhado no login:', err);
      setErro('Ocorreu um erro ao processar o login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>
          <span className="logo-obra">Obra</span><span className="logo-voz">Voz</span>
        </h1>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
