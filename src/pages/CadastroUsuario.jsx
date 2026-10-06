import React, { useState } from 'react';
import { db } from '../db/db';
import '../App.css';

function CadastroUsuario() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    permissao: 'leitor'
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const emailLimpo = formData.email.toLowerCase().trim();

      // Grava diretamente na tabela 'usuarios' do Dexie (IndexedDB)
      await db.usuarios.add({
        nome: formData.nome,
        email: emailLimpo,
        permissao: formData.permissao,
        criadoEm: new Date()
      });

      setStatus(`✅ Utilizador ${formData.nome} autorizado!`);
      setFormData({ nome: '', email: '', permissao: 'leitor' });
    } catch (err) {
      console.error("Erro ao autorizar utilizador:", err);
      // O Dexie impede duplicados se o campo email tiver a regra '&email'
      setStatus('❌ Este e-mail já está autorizado.');
    }

    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h2 style={{ color: 'var(--blue-primary)', marginBottom: '8px', fontSize: '1.2rem' }}>
        🔐 Cadastro de Autorização
      </h2>
      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
        Defina quem pode visualizar ou editar os relatórios da obra.
      </p>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="campo-group">
          <label>Nome do Colaborador</label>
          <input
            type="text"
            name="nome"
            placeholder="Ex: João Silva"
            value={formData.nome}
            onChange={handleChange}
            required
            className="login-input"
          />
        </div>

        <div className="campo-group">
          <label>E-mail de Acesso</label>
          <input
            type="email"
            name="email"
            placeholder="colaborador@obra.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="login-input"
          />
        </div>

        <div className="campo-group">
          <label>Nível de Acesso</label>
          <select 
            name="permissao" 
            value={formData.permissao} 
            onChange={handleChange} 
            className="select-elemento"
            style={{ width: '100%', height: '42px' }}
          >
            <option value="leitor">👀 Leitor (Apenas visualizar)</option>
            <option value="editor">✍️ Editor (Criar e editar relatos)</option>
          </select>
        </div>

        <button type="submit" className="btn-finalizar" style={{ marginTop: '10px' }}>
          Autorizar Acesso
        </button>
      </form>

      {status && (
        <div className="clima-badge" style={{ marginTop: '15px', width: '100%', textAlign: 'center', padding: '10px' }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default CadastroUsuario;
