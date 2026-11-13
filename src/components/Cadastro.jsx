import React, { useState } from 'react';
import { cadastrarUsuarioLocal } from '../db/usuarioService';
import { sql } from '../services/neonClient';

export function Cadastro({ aoVoltarAoLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados para controlar a visibilidade de cada palavra-passe
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [permissao, setPermissao] = useState('user');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    // Validação de correspondência das senhas
    if (senha !== confirmarSenha) {
      setErro('As palavras-passe não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      const emailLimpo = email.toLowerCase().trim();

      // 1. Guarda localmente no Dexie
      const resLocal = await cadastrarUsuarioLocal(nome, emailLimpo, permissao);
      
      if (!resLocal.sucesso) {
        setErro(resLocal.erro || 'Erro ao registar localmente.');
        setCarregando(false);
        return;
      }

      // 2. Se houver internet, insere também na nuvem (Neon)
      if (navigator.onLine) {
        try {
          await sql`
            INSERT INTO usuarios (id, nome, email, password, permissao)
            VALUES (gen_random_uuid(), ${nome}, ${emailLimpo}, ${senha}, ${permissao})
            ON CONFLICT (email) DO UPDATE SET
              nome = EXCLUDED.nome,
              permissao = EXCLUDED.permissao,
              password = EXCLUDED.password;
          `;
        } catch (neonErr) {
          console.warn('Aviso: Guardado localmente, mas a sincronização com o Neon falhou temporariamente:', neonErr);
        }
      }

      setMensagem('✅ Utilizador cadastrado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
      
      // Voltar ao login após 2 segundos
      setTimeout(() => {
        if (aoVoltarAoLogin) aoVoltarAoLogin();
      }, 2000);

    } catch (err) {
      setErro('Ocorreu um erro ao processar o cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🏗️ ObraVoz</h1>
        <p className="login-subtitulo">Diário de Obra Inteligente</p>
        
        {erro && <div className="login-erro">{erro}</div>}
        {mensagem && (
          <div style={{ background: 'rgba(0, 122, 255, 0.2)', border: '1px solid #007AFF', color: '#007AFF', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
            {mensagem}
          </div>
        )}

        <form className="login-form" onSubmit={handleCadastro}>
          <div className="campo-group">
            <label>Nome Completo</label>
            <input 
              className="login-input" 
              type="text" 
              placeholder="Nome e Apelido" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
            />
          </div>

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

          {/* Campo Palavra-passe */}
          <div className="campo-group">
            <label>Palavra-passe</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                className="login-input" 
                type={mostrarSenha ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                style={{ paddingRight: '42px', width: '100%' }}
                required 
              />
              <button
                type="button"
                onPointerDown={() => setMostrarSenha(true)}
                onPointerUp={() => setMostrarSenha(false)}
                onPointerLeave={() => setMostrarSenha(false)}
                onPointerCancel={() => setMostrarSenha(false)}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Segure para visualizar a palavra-passe"
                title="Segure para ver a palavra-passe"
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#888',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none'
                }}
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

          {/* Campo Confirmar Palavra-passe */}
          <div className="campo-group">
            <label>Confirmar Palavra-passe</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                className="login-input" 
                type={mostrarConfirmarSenha ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={confirmarSenha} 
                onChange={e => setConfirmarSenha(e.target.value)} 
                style={{ paddingRight: '42px', width: '100%' }}
                required 
              />
              <button
                type="button"
                onPointerDown={() => setMostrarConfirmarSenha(true)}
                onPointerUp={() => setMostrarConfirmarSenha(false)}
                onPointerLeave={() => setMostrarConfirmarSenha(false)}
                onPointerCancel={() => setMostrarConfirmarSenha(false)}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Segure para visualizar a confirmação"
                title="Segure para ver a confirmação"
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#888',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none'
                }}
              >
                {mostrarConfirmarSenha ? (
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

          <div className="campo-group">
            <label>Permissão</label>
            <select 
              className="login-input" 
              value={permissao} 
              onChange={e => setPermissao(e.target.value)}
            >
              <option value="user" style={{ background: '#1E1E1E', color: '#FFF' }}>Utilizador (Operacional)</option>
              <option value="admin" style={{ background: '#1E1E1E', color: '#FFF' }}>Administrador</option>
            </select>
          </div>

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? 'A registar...' : 'Cadastrar Utilizador'}
          </button>
        </form>

        {aoVoltarAoLogin && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button 
              type="button"
              onClick={aoVoltarAoLogin}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--blue-primary, #007AFF)', 
                cursor: 'pointer', 
                fontSize: '0.9rem',
                textDecoration: 'underline' 
              }}
            >
              Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
