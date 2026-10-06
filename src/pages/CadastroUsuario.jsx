import React, { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Recupera usuários já salvos ou cria array vazio
    const usuariosAtuais = JSON.parse(localStorage.getItem('usuariosObra')) || [];
    
    // Adiciona o novo usuário com um ID único e data de criação
    const novoUsuario = { 
      ...formData, 
      id: Date.now(),
      criadoEm: new Date().toLocaleDateString('pt-PT')
    };
    
    const novaLista = [...usuariosAtuais, novoUsuario];

    // Salva no LocalStorage
    localStorage.setItem('usuariosObra', JSON.stringify(novaLista));

    setStatus(`✅ Usuário ${formData.nome} autorizado!`);
    
    // Limpa o formulário
    setFormData({ nome: '', email: '', permissao: 'leitor' });

    // Remove a mensagem após 3 segundos
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
