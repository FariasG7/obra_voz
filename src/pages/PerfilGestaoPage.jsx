// src/pages/PerfilGestaoPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function PerfilGestaoPage() {
  const { usuario, logout } = useAuth();

  const [nome, setNome] = useState(usuario?.nome || 'Encarregado Principal');
  const [email, setEmail] = useState(usuario?.email || 'encarregado@obravoz.pt');
  const [cargo, setCargo] = useState(usuario?.cargo || 'Encarregado de Construção Civil');
  const [companyId] = useState(usuario?.companyId || 'EMP_VALE_DO_LOBO_01');
  const [statusPerfilMsg, setStatusPerfilMsg] = useState('');

  const [equipa, setEquipa] = useState([
    { id: 1, nome: 'Guilherme Farias', email: 'guilherme@obravoz.pt', papel: 'Administrador' },
    { id: 2, nome: 'Eudes Cadete', email: 'eudes@obravoz.pt', papel: 'Gestor' },
    { id: 3, nome: 'Manuel Silva', email: 'manuel.silva@obravoz.pt', papel: 'Colaborador' }
  ]);

  const [novoEmailConvite, setNovoEmailConvite] = useState('');
  const [novoPapelConvite, setNovoPapelConvite] = useState('Colaborador');
  const [statusConviteMsg, setStatusConviteMsg] = useState('');

  const handleSalvarPerfil = (e) => {
    e.preventDefault();
    setStatusPerfilMsg('✅ Dados de perfil guardados com sucesso!');
    setTimeout(() => setStatusPerfilMsg(''), 3000);
  };

  const handleConvidarMembro = (e) => {
    e.preventDefault();
    if (!novoEmailConvite.trim()) return;

    const novoMembro = {
      id: Date.now(),
      nome: novoEmailConvite.split('@')[0],
      email: novoEmailConvite.trim(),
      papel: novoPapelConvite
    };

    setEquipa([...equipa, novoMembro]);
    setNovoEmailConvite('');
    setStatusConviteMsg(`✅ Convite enviado com sucesso para ${novoMembro.email}!`);
    setTimeout(() => setStatusConviteMsg(''), 4000);
  };

  const handleAlterarPapel = (id, novoPapel) => {
    setEquipa(equipa.map(m => m.id === id ? { ...m, papel: novoPapel } : m));
  };

  const handleRemoverMembro = (id) => {
    if (confirm('Tem certeza que deseja remover este membro da empresa?')) {
      setEquipa(equipa.filter(m => m.id !== id));
    }
  };

  return (
    <div className="content perfil-content-wrapper">
      
      {/* Cabeçalho */}
      <div className="perfil-header">
        <h2 className="perfil-titulo">
          🔐 Perfil & Gestão Corporativa
        </h2>
        <p className="perfil-subtitulo">
          Controlo de conta, empresa (Tenant) e permissões de utilizadores (RBAC)
        </p>
      </div>

      {/* SEÇÃO 1: DADOS DO PERFIL / EMPRESA */}
      <div className="card perfil-section-card">
        <h3 className="perfil-section-titulo">
          👤 Os Meus Dados & Vínculo
        </h3>

        <form onSubmit={handleSalvarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="perfil-grid-2">
            <div>
              <label className="perfil-label">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="perfil-input"
                required
              />
            </div>
            <div>
              <label className="perfil-label">E-mail de Acesso</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="perfil-input"
                required
              />
            </div>
          </div>

          <div className="perfil-grid-2">
            <div>
              <label className="perfil-label">Cargo / Função</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="perfil-input"
              />
            </div>
            <div>
              <label className="perfil-label">ID da Empresa (Tenant ID)</label>
              <input
                type="text"
                value={companyId}
                disabled
                className="perfil-input-disabled"
              />
            </div>
          </div>

          <div className="perfil-acoes-footer">
            <button
              type="submit"
              className="btn-salvar-perfil"
            >
              💾 Atualizar Perfil
            </button>

            <button
              type="button"
              onClick={logout}
              className="btn-sair-conta"
            >
              🚪 Sair da Conta
            </button>
          </div>

          {statusPerfilMsg && (
            <div className="perfil-feedback-msg">
              {statusPerfilMsg}
            </div>
          )}
        </form>
      </div>

      {/* SEÇÃO 2: GESTÃO DE EQUIPA E PERMISSÕES (RBAC) */}
      <div className="card perfil-section-card">
        <h3 className="perfil-section-titulo">
          👥 Gestão de Equipa & Permissões (RBAC)
        </h3>
        <p className="rbac-descricao">
          Atribua papéis operacionais: <strong style={{ color: '#fff' }}>Administrador</strong> (controlo total), <strong style={{ color: '#fff' }}>Gestor</strong> (aprovações e relatórios) ou <strong style={{ color: '#fff' }}>Colaborador</strong> (registo em campo).
        </p>

        {/* Formulário para convidar novo membro */}
        <form onSubmit={handleConvidarMembro} className="rbac-form-convite">
          <input
            type="email"
            placeholder="colaborador@empresa.pt"
            value={novoEmailConvite}
            onChange={(e) => setNovoEmailConvite(e.target.value)}
            className="perfil-input"
            style={{ flex: 1, minWidth: '200px' }}
            required
          />
          <select
            value={novoPapelConvite}
            onChange={(e) => setNovoPapelConvite(e.target.value)}
            className="perfil-input"
            style={{ width: 'auto' }}
          >
            <option value="Colaborador" style={{ background: '#1E1E1E', color: '#FFF' }}>Colaborador</option>
            <option value="Gestor" style={{ background: '#1E1E1E', color: '#FFF' }}>Gestor</option>
            <option value="Administrador" style={{ background: '#1E1E1E', color: '#FFF' }}>Administrador</option>
          </select>
          <button
            type="submit"
            className="btn-convidar"
          >
            ✉️ Convidar
          </button>
        </form>

        {statusConviteMsg && (
          <div className="perfil-feedback-msg" style={{ marginBottom: '15px' }}>
            {statusConviteMsg}
          </div>
        )}

        {/* Tabela / Lista de Membros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {equipa.map((membro) => {
            const corPapel = 
              membro.papel === 'Administrador' ? '#facc15' : 
              membro.papel === 'Gestor' ? '#3b82f6' : '#4ade80';

            return (
              <div
                key={membro.id}
                className="rbac-membro-card"
              >
                <div>
                  <p className="rbac-membro-nome">{membro.nome}</p>
                  <span className="rbac-membro-email">{membro.email}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={membro.papel}
                    onChange={(e) => handleAlterarPapel(membro.id, e.target.value)}
                    className="rbac-select-papel"
                    style={{ color: corPapel }}
                  >
                    <option value="Colaborador" style={{ background: '#1E1E1E', color: '#4ade80' }}>Colaborador</option>
                    <option value="Gestor" style={{ background: '#1E1E1E', color: '#3b82f6' }}>Gestor</option>
                    <option value="Administrador" style={{ background: '#1E1E1E', color: '#facc15' }}>Administrador</option>
                  </select>

                  <button
                    onClick={() => handleRemoverMembro(membro.id)}
                    className="btn-remover-membro"
                    title="Remover membro"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PerfilGestaoPage;
