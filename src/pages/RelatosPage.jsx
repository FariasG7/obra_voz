// src/pages/RelatosPage.jsx
import React from 'react';
import NovoDiarioScreen from '../screens/NovoDiarioScreen';

export default function RelatosPage({ sessao, onSessaoVoltar, onSessaoFinalizada }) {
  return (
    <div>
      {/* Barra de cabeçalho para voltar e alterar dados da obra */}
      <div style={{ padding: '10px 20px', background: '#181818', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Obra: <strong style={{ color: '#fff' }}>{sessao.obraNome}</strong> {sessao.setorPavimento ? `| Setor: ${sessao.setorPavimento}` : ''}
        </span>
        <button 
          type="button" 
          onClick={onSessaoVoltar}
          style={{ background: 'transparent', border: 'none', color: '#2AA1C0', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
        >
          ← Alterar Turno/Obra
        </button>
      </div>

      {/* Renderiza o ecrã completo de Diário de Obra (com voz, fotos e PDF) */}
      <NovoDiarioScreen 
        obraId={sessao.obraId} 
        dadosTurno={sessao}
        onDiarioSalvo={(diarioSalvo) => {
          // Quando o diário for guardado com sucesso, limpa a sessão e finaliza o fluxo
          localStorage.removeItem('obravoz_sessao_ativa');
          if (onSessaoFinalizada) onSessaoFinalizada(diarioSalvo);
        }} 
      />
    </div>
  );
}
