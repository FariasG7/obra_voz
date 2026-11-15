// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useClima } from '../hooks/useClima';
import { useAuth } from '../context/AuthContext';
import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function Navbar({ paginaAtual, setPaginaAtual, obraSelecionada }) {
  const { clima } = useClima();
  const { logout } = useAuth(); // Puxa o logout diretamente do AuthContext
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


      if (loading) {
  return <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>A carregar...</div>;
}
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
          <span className="logo-obra">Obra</span>
          <span className="logo-voz">Voz</span>
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

        <button 
          className="obra-nav-btn obra-btn-sair" 
          onClick={logout}
          title="Encerrar sessão"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
