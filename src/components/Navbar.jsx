// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useClima } from '../hooks/useClima'; // Ajusta o caminho se necessário
import { db } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function Navbar({ paginaAtual, setPaginaAtual }) {
  const { clima } = useClima();
  const [loading, setLoading] = useState(false);

  const executarTesteSync = async () => {
    setLoading(true);
    try {
      const novoId = crypto.randomUUID();
      await db.projetos.add({
        id: novoId,
        nome: 'Obra Teste - Navbar',
        localizacao: 'Algarve',
        cliente: 'Cliente Teste',
        data_inicio: '2026-10-27',
        status: 'em_andamento',
        synced: 0,
      });

      const res = await sincronizarComNuvem(db);

      if (res.success) {
        alert(`✅ Sucesso! Registo sincronizado com o Neon.`);
      } else {
        alert(`⚠️ Gravado localmente, mas falhou ao sincronizar: ${res.error || res.reason}`);
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

  const menuStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
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

  const btnSyncStyle = {
    background: loading ? '#555' : '#2AA1C0',
    color: '#fff',
    border: '1px solid #333',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
  };

  return (
    <nav style={navStyle}>
      <div style={leftSectionStyle}>
        <h1 style={logoStyle}>🏗️ Obra</h1><h1 style={{ ...logoStyle, color: '#fff' }}>Voz</h1>
        <div className={'clima-badge'} style={{ fontSize: '0.85rem', color: '#ccc', backgroundColor: '#252525', padding: '4px 10px', borderRadius: '6px', border: '1px solid #333', whiteSpace: 'nowrap' }}>{clima}</div>
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

        {/* Botão de Teste de Sincronização */}
        <button 
          style={btnSyncStyle} 
          onClick={executarTesteSync}
          disabled={loading}
        >
          {loading ? 'A sync...' : '🔄 Testar Sync'}
        </button>
      </div>
    </nav>
  );
}
