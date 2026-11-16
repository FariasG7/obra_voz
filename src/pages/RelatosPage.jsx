// src/pages/RelatosPage.jsx
import React from 'react';
import NovoDiarioScreen from '../screens/NovoDiarioScreen';

export default function RelatosPage({ sessao, onSessaoVoltar, onSessaoFinalizada }) {
  // Se por acaso a sessão vier vazia, recupera do localStorage para evitar crash
  const sessaoAtual = sessao || JSON.parse(localStorage.getItem('obravoz_sessao_ativa') || '{}');

  return (
    <div>
      {/* Cabeçalho de controlo de turno */}
      <div style={{ padding: '10px 20px', background: '#181818', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Obra: <strong style={{ color: '#fff' }}>{sessaoAtual.obraNome || sessaoAtual.obraId || 'Geral'}</strong> 
          {sessaoAtual.setorPavimento ? ` | Setor: ${sessaoAtual.setorPavimento}` : ''}
        </span>
        <button 
          type="button" 
          onClick={onSessaoVoltar}
          style={{ background: 'transparent', border: 'none', color: '#2AA1C0', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
        >
          ← Alterar Turno/Obra
        </button>
      </div>

      {/* Ecrã principal do Diário com passagem correta do ID e dados da sessão */}
      <NovoDiarioScreen 
        obraId={sessaoAtual.obraId || sessaoAtual.obraNome || 'geral'} 
        userId={sessaoAtual.userId || null}
        dadosTurno={sessaoAtual}
        onDiarioSalvo={(diarioSalvo) => {
          localStorage.removeItem('obravoz_sessao_ativa');
          if (onSessaoFinalizada) onSessaoFinalizada(diarioSalvo);
        }} 
      />
    </div>
  );
}
