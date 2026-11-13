// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useClima } from '../hooks/useClima';
import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function Navbar({ paginaAtual, setPaginaAtual }) {
  const { clima } = useClima();
  const [loading, setLoading] = useState(false);

  const executarTesteSync = async () => {
    setLoading(true);
    try {
      const novoId = generateUUID();
      
      await db.obras.add({
        id: novoId,
        nome_obra: 'Obra Teste - Navbar',
        status: 'em_andamento',
        synced: 0,
      });

      const res = await sincronizarComNuvem(db);

      if (res.success) {
        alert('✅ Sucesso! Obra sincronizada com o Neon.');
      } else {
        alert(`⚠️ Gravado localmente no Dexie, mas falhou no Neon: ${res.error || res.reason}`);
      }
    } catch (err) {
      console.error('Erro no teste de sincronização:', err);
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    boxSizing: 'border-box',
    width: '100%'
  };

  const leftSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  };

  const logoStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  };

  const menuStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const btnStyle = (ativo) => ({
    background: ativo ? 'var(--blue-primary, #2AA1C0)' : '#252525',
    color: '#fff',
    border: '1px solid #333',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s',
  });

  const btnSyncStyle = {
    background: loading ? '#555' : 'var(--blue-primary, #2AA1C0)',
    color: '#fff',
    border: '1px solid #333',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
  };

  return (
    <nav style={navStyle}>
      <div style={leftSectionStyle}>
        <h1 style={logoStyle}>
          🏗️ <span style={{ color: 'var(--blue-primary, #2AA1C0)' }}>Obra</span><span style={{ color: '#fff' }}>Voz</span>
        </h1>
        <div style={{ fontSize: '0.8rem', color: '#ccc', backgroundColor: '#252525', padding: '4px 8px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'nowrap' }}>
          {clima || 'Clima indisponível'}
        </div>
      </div>

      <div style={menuStyle}>
        <button 
          style={btnStyle(paginaAtual === 'selecao')} 
          onClick={() => setPaginaAtual('selecao')}
        >
          Turno
        </button>
        <button 
          style={btnStyle(paginaAtual === 'relatos')} 
          onClick={() => setPaginaAtual('relatos')}
        >
          Relatos
        </button>

        <button 
          style={btnSyncStyle} 
          onClick={executarTesteSync}
          disabled={loading}
          title="Testar Sincronização com o Neon"
        >
          {loading ? 'A sync...' : '🔄 Sync'}
        </button>
      </div>
    </nav>
  );
}
