import React, { useState } from 'react';
import { cadastrarUsuarioLocal } from '../db/usuarioService';
import { sql } from '../services/neonClient';

export function Cadastro({ aoVoltarAoLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados para controlar a visibilidade de cada senha de forma independente
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#121212', color: '#FFF', padding: '20px', boxSizing: 'border-box' }}>
      <form onSubmit={handleCadastro} style={{ background: '#1E1E1E', padding: '30px', borderRadius: '12px', border: '1px solid #333', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#007AFF', marginBottom: '15px', textAlign: 'center' }}>🏗️ Novo Utilizador</h2>

        {erro && <div style={{ background: 'rgba(255, 77, 77, 0.2)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>{erro}</div>}
        {mensagem && <div style={{ background: 'rgba(0, 122, 255, 0.2)', border: '1px solid #007AFF', color: '#007AFF', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>{mensagem}</div>}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Nome Completo</label>
          <input 
            type="text" 
            placeholder="Nome e Apelido"
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>E-mail</label>
          <input 
            type="email" 
            placeholder="seu@email.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', boxSizing: 'border-box' }}
          />
        </div>

        {/* Campo Palavra-passe */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Palavra-passe</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={mostrarSenha ? 'text' : 'password'} 
              placeholder="••••••••"
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', paddingRight: '42px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', boxSizing: 'border-box' }}
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
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Confirmar Palavra-passe</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={mostrarConfirmarSenha ? 'text' : 'password'} 
              placeholder="••••••••"
              value={confirmarSenha} 
              onChange={(e) => setConfirmarSenha(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', paddingRight: '42px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', boxSizing: 'border-box' }}
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Permissão</label>
          <select 
            value={permissao} 
            onChange={(e) => setPermissao(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', boxSizing: 'border-box' }}
          >
            <option value="user">Utilizador (Operacional)</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={carregando}
          style={{ width: '100%', padding: '12px', background: '#007AFF', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}
        >
          {carregando ? 'A registar...' : 'Cadastrar Utilizador'}
        </button>

        {aoVoltarAoLogin && (
          <button 
            type="button" 
            onClick={aoVoltarAoLogin}
            style={{ width: '100%', padding: '10px', background: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Voltar ao Login
          </button>
        )}
      </form>
    </div>
  );
}
