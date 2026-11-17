// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

export function Navbar({ paginaAtual, setPaginaAtual, obraSelecionada, onLogout }) {
  const [climaLocal, setClimaLocal] = useState('A carregar clima...');
  const [loading, setLoading] = useState(false);

  // Simulação / Busca direta de clima por geolocalização para garantir robustez
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Utilizando Open-Meteo (API gratuita e sem chave obrigatória)
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            
            if (data && data.current_weather) {
              const temp = Math.round(data.current_weather.temperature);
              const wmoCode = data.current_weather.weathercode;
              
              // Tradução simples de códigos de tempo WMO
              let condicao = 'Bom tempo';
              if (wmoCode >= 1 && wmoCode <= 3) condicao = 'Parcialmente nublado';
              else if (wmoCode >= 51 && wmoCode <= 67) condicao = 'Chuva';
              else if (wmoCode >= 95) condicao = 'Trovoada';

              setClimaLocal(`${condicao}, ${temp}°C`);
            } else {
              setClimaLocal('Algarve, 19°C (Parcial)');
            }
          } catch (err) {
            console.error('Erro ao buscar clima:', err);
            setClimaLocal('Algarve, 19°C');
          }
        },
        (error) => {
          console.warn('Geolocalização negada ou indisponível:', error);
          // Fallback padrão para a região de atuação (Algarve)
          setClimaLocal('Algarve, 19°C (Sol)');
        },
        { timeout: 10000 }
      );
    } else {
      setClimaLocal('Algarve, 19°C');
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
    <nav className="obra-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#181818', borderBottom: '1px solid #333', flexWrap: 'wrap', gap: '10px' }}>
      
      {/* Lado Esquerdo: Logótipo + Clima + Obra Ativa */}
      <div className="obra-navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <div className="obra-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="obra-logo-icone">🏗️</span>
          <span className="logo-obra" style={{ color: '#fff', fontWeight: 'bold' }}>Obra</span>
          <span className="logo-voz" style={{ color: '#2AA1C0', fontWeight: 'bold' }}>Voz</span>
        </div>
        
        {/* Badge explicita de Clima e Obra */}
        <div className="obra-info-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#222', padding: '6px 12px', borderRadius: '6px', border: '1px solid #333', fontSize: '0.85rem' }}>
          <span className="obra-clima-texto" style={{ color: '#48dbfb', fontWeight: '500', whiteSpace: 'nowrap' }}>
            🌤️ {climaLocal}
          </span>

          {obraSelecionada && (
            <>
              <span className="obra-separator" style={{ color: '#666' }}>|</span>
              <span className="obra-nome-ativo" style={{ color: '#ddd', whiteSpace: 'nowrap' }}>
                📍 <strong>{obraSelecionada}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lado Direito: Menu de Navegação */}
      <div className="obra-navbar-menu" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
