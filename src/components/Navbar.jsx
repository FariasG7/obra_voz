// src/components/Navbar.jsx
import React from 'react';

export function Navbar({ paginaAtual, setPaginaAtual }) {
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

  const logoStyle = {
    color: 'var(--blue-primary)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
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
      <div style={logoStyle}>ObraVoz</div>
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
