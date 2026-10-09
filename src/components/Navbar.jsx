// src/components/Navbar.jsx
import React from 'react';
import { useClima } from '../hooks/useClima'; // Ajusta o caminho se necessário

export function Navbar({ paginaAtual, setPaginaAtual }) {
  const { clima } = useClima();

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: '12px 20px',
    borderBottom: '1px solid #333',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  const logoStyle = {
    color: 'var(--blue-primary)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: 0,
  };

  const climaBadgeStyle = {
    fontSize: '0.85rem',
    color: '#ccc',
    backgroundColor: '#252525',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #333',
    whiteSpace: 'nowrap',
  };

  const menuStyle = {
    display: 'flex',
    gap: '10px',
  };

  const btnStyle = (ativo) => ({
    background: ativo ? 'var(--blue-primary)' : 'transparent',
    color: '#fff',
    border: '1px solid #333',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s',
  });

  return (
    <nav style={navStyle}>
      <div style={leftSectionStyle}>
        <h1 style={logoStyle}>🏗️ ObraVoz</h1>
        <div className={'clima-badge'}>{clima}</div>
      </div>

      <div style={menuStyle}>
        <button 
          style={btnStyle(paginaAtual === 'selecao')} 
          onClick={() => setPaginaAtual('selecao')}
        >
          Turno / Obra
        </button>
        <button 
          style={btnStyle(paginaAtual === 'relatos')} 
          onClick={() => setPaginaAtual('relatos')}
        >
          Relatos (Diário)
        </button>
      </div>
    </nav>
  );
}
