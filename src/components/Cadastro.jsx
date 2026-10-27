import React, { useState } from 'react';
import { cadastrarUsuarioLocal } from '../db/usuarioService';
import { sql } from '../services/neonClient';

export function Cadastro({ aoVoltarAoLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [permissao, setPermissao] = useState('user');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
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
      
      // Opcional: Voltar ao login após 2 segundos
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: '#FFF' }}>
      <form onSubmit={handleCadastro} style={{ background: '#1E1E1E', padding: '30px', borderRadius: '12px', border: '1px solid #333', width: '350px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#007AFF', marginBottom: '15px', textAlign: 'center' }}>🏗️ Novo Utilizador</h2>

        {erro && <div style={{ background: 'rgba(255, 77, 77, 0.2)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>{erro}</div>}
        {mensagem && <div style={{ background: 'rgba(0, 122, 255, 0.2)', border: '1px solid #007AFF', color: '#007AFF', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>{mensagem}</div>}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Nome Completo</label>
          <input 
            type="text" 
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
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>Palavra-passe</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#2A2A2A', border: '1px solid #444', color: '#FFF', boxSizing: 'border-box' }}
          />
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
