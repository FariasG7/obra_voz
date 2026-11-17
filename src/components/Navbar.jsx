// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useClima } from '../hooks/useClima';
import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function Navbar({ paginaAtual, setPaginaAtual, obraSelecionada, onLogout }) {
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
    <nav className="obra-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#181818', borderBottom: '1px solid #333' }}>
      
      {/* Lado Esquerdo: Logótipo + Clima + Obra Ativa */}
      <div className="obra-navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div className="obra-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="obra-logo-icone">🏗️</span>
          <span className="logo-obra" style={{ color: '#fff', fontWeight: 'bold' }}>Obra</span>
          <span className="logo-voz" style={{ color: '#2AA1C0', fontWeight: 'bold' }}>Voz</span>
        </div>
        
        {/* Badge explicita de Clima e Obra */}
        <div className="obra-info-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#222', padding: '6px 12px', borderRadius: '6px', border: '1px solid #333', fontSize: '0.85rem' }}>
          <span className="obra-clima-texto" style={{ color: '#48dbfb', fontWeight: '500' }}>
            🌤️ {clima ? clima : 'A detetar clima...'}
          </span>

          {obraSelecionada && (
            <>
              <span className="obra-separator" style={{ color: '#666' }}>|</span>
              <span className="obra-nome-ativo" style={{ color: '#ddd' }}>
                📍 <strong>{obraSelecionada}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lado Direito: Menu de Navegação */}
      <div className="obra-navbar-menu" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          onClick={onLogout}
          title="Encerrar sessão"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
