// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function Navbar({ paginaAtual, setPaginaAtual, obraSelecionada, onLogout }) {
  const [climaLocal, setClimaLocal] = useState('Algarve, 19°C (Sol)');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            
            if (data && data.current_weather) {
              const temp = Math.round(data.current_weather.temperature);
              const wmoCode = data.current_weather.weathercode;
              
              let condicao = 'Bom tempo';
              if (wmoCode >= 1 && wmoCode <= 3) condicao = 'Parcialmente nublado';
              else if (wmoCode >= 51 && wmoCode <= 67) condicao = 'Chuva';
              else if (wmoCode >= 95) condicao = 'Trovoada';

              setClimaLocal(`${condicao}, ${temp}°C`);
            }
          } catch (err) {
            console.error('Erro ao buscar clima:', err);
          }
        },
        (error) => {
          console.warn('Geolocalização não permitida:', error);
        },
        { timeout: 7000 }
      );
    }
  }, []);

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
        alert(`⚠️ Gravado localmente, mas falhou no Neon: ${res.error || res.reason}`);
      }
    } catch (err) {
      console.error('Erro no teste de sincronização:', err);
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#181818', borderBottom: '1px solid #333', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Lado Esquerdo: Logótipo + Bloco de Informações (Clima + Obra) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.2rem' }}>🏗️</span>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Obra</span>
          <span style={{ color: '#2AA1C0', fontWeight: 'bold', fontSize: '1.1rem' }}>Voz</span>
        </div>
        
        {/* Bloco Clima e Obra rigorosamente visível */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#222', padding: '6px 14px', borderRadius: '8px', border: '1px solid #444' }}>
          <span style={{ color: '#48dbfb', fontWeight: '500', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            🌤️ {climaLocal}
          </span>

          {obraSelecionada && (
            <>
              <span style={{ color: '#666' }}>|</span>
              <span style={{ color: '#ddd', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                📍 <strong>{obraSelecionada}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lado Direito: Menu de Navegação */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
