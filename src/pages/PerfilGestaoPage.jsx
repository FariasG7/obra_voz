import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export function PerfilGestaoPage() {
  const { usuario, logout } = useAuth();

  // Estados para dados de perfil
  const [nome, setNome] = useState(usuario?.nome || 'Encarregado Principal');
  const [email, setEmail] = useState(usuario?.email || 'encarregado@obravoz.pt');
  const [cargo, setCargo] = useState(usuario?.cargo || 'Encarregado de Construção Civil');
  const [companyId] = useState(usuario?.companyId || 'EMP_VALE_DO_LOBO_01');
  const [statusPerfilMsg, setStatusPerfilMsg] = useState('');

  // Estados para Gestão de Equipa (RBAC)
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
    // Aqui atualizaríamos no contexto ou base de dados local
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
    <div className="content" style={{ maxWidth: '700px', margin: '0 auto', padding: '15px' }}>
      
      {/* Cabeçalho */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--blue-light, #3b82f6)', fontSize: '1.4rem', fontWeight: 'bold' }}>
          🔐 Perfil & Gestão Corporativa
        </h2>
        <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '2px' }}>
          Controlo de conta, empresa (Tenant) e permissões de utilizadores (RBAC)
        </p>
      </div>

      {/* SEÇÃO 1: DADOS DO PERFIL / EMPRESA */}
      <div className="card" style={{ padding: '20px', marginBottom: '25px', background: '#1e1e1e', borderRadius: '10px', border: '1px solid #333' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
          👤 Os Meus Dados & Vínculo
        </h3>

        <form onSubmit={handleSalvarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff', fontSize: '0.9rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>E-mail de Acesso</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff', fontSize: '0.9rem' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>Cargo / Função</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>ID da Empresa (Tenant ID)</label>
              <input
                type="text"
                value={companyId}
                disabled
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#666', fontSize: '0.9rem', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button
              type="submit"
              style={{ background: 'var(--blue-primary, #2563eb)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              💾 Atualizar Perfil
            </button>

            <button
              type="button"
              onClick={logout}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              🚪 Sair da Conta
            </button>
          </div>

          {statusPerfilMsg && (
            <div style={{ textAlign: 'center', padding: '8px', background: '#222', borderRadius: '6px', border: '1px solid #444', fontSize: '0.85rem', color: '#4ade80' }}>
              {statusPerfilMsg}
            </div>
          )}
        </form>
      </div>

      {/* SEÇÃO 2: GESTÃO DE EQUIPA E PERMISSÕES (RBAC) */}
      <div className="card" style={{ padding: '20px', background: '#1e1e1e', borderRadius: '10px', border: '1px solid #333' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
          👥 Gestão de Equipa & Permissões (RBAC)
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '15px' }}>
          Atribua papéis operacionais: <strong style={{ color: '#fff' }}>Administrador</strong> (controlo total), <strong style={{ color: '#fff' }}>Gestor</strong> (aprovações e relatórios) ou <strong style={{ color: '#fff' }}>Colaborador</strong> (registo em campo).
        </p>

        {/* Formulário para convidar novo membro */}
        <form onSubmit={handleConvidarMembro} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="colaborador@empresa.pt"
            value={novoEmailConvite}
            onChange={(e) => setNovoEmailConvite(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '9px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff', fontSize: '0.9rem' }}
            required
          />
          <select
            value={novoPapelConvite}
            onChange={(e) => setNovoPapelConvite(e.target.value)}
            style={{ padding: '9px', borderRadius: '6px', border: '1px solid #444', background: '#121212', color: '#fff', fontSize: '0.9rem' }}
          >
            <option value="Colaborador">Colaborador</option>
            <option value="Gestor">Gestor</option>
            <option value="Administrador">Administrador</option>
          </select>
          <button
            type="submit"
            style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ✉️ Convidar
          </button>
        </form>

        {statusConviteMsg && (
          <div style={{ marginBottom: '15px', textAlign: 'center', padding: '8px', background: '#222', borderRadius: '6px', border: '1px solid #444', fontSize: '0.85rem', color: '#4ade80' }}>
            {statusConviteMsg}
          </div>
        )}

        {/* Tabela / Lista de Membros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {equipa.map((membro) => (
            <div
              key={membro.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#121212',
                borderRadius: '8px',
                border: '1px solid #333',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>{membro.nome}</p>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{membro.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={membro.papel}
                  onChange={(e) => handleAlterarPapel(membro.id, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #444',
                    background: '#1a1a1a',
                    color: membro.papel === 'Administrador' ? '#facc15' : membro.papel === 'Gestor' ? '#3b82f6' : '#4ade80',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="Colaborador">Colaborador</option>
                  <option value="Gestor">Gestor</option>
                  <option value="Administrador">Administrador</option>
                </select>

                <button
                  onClick={() => handleRemoverMembro(membro.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
                  title="Remover membro"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PerfilGestaoPage;
