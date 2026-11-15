// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useClima } from '../hooks/useClima';
import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';
import './Navbar.css';

export function Navbar({ paginaAtual, setPaginaAtual, obraSelecionada }) {
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

  return (
    <nav className="obra-navbar">
      <div className="obra-navbar-left">
        <div className="obra-logo-container">
          <span className="obra-logo-icone">🏗️</span>
         <h1> <span className="logo-obra">Obra</span></h1>

         <h1><span className="logo-voz">Voz</span></h1>
        
        </div>
        
        <div className="obra-info-badge">
          {obraSelecionada && (
            <>
              <span className="obra-nome-ativo">📍 {obraSelecionada}</span>
              <span className="obra-separator">•</span>
            </>
          )}
          <span className="obra-clima-texto">{clima || 'Clima indisponível'}</span>
        </div>
      </div>

      <div className="obra-navbar-menu">
        <button 
          className={`obra-nav-btn ${paginaAtual === 'selecao' ? 'ativo' : ''}`}
          onClick={() => setPaginaAtual('selecao')}
        >
          Turno / Obra
        </button>
        <button 
          className={`obra-nav-btn ${paginaAtual === 'relatos' ? 'ativo' : ''}`}
          onClick={() => setPaginaAtual('relatos')}
        >
          Relatos (Diário)
        </button>
        <button 
          className={`obra-nav-btn ${paginaAtual === 'historico' ? 'ativo' : ''}`}
          onClick={() => setPaginaAtual('historico')}
        >
          Histórico
        </button>
        <button 
          className={`obra-nav-btn ${paginaAtual === 'perfil' ? 'ativo' : ''}`}
          onClick={() => setPaginaAtual('perfil')}
        >
          Perfil
        </button>

        <button 
          className="obra-sync-btn" 
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

export default Navbar;
