// src/components/Navbar.jsx
import React from 'react';

export function Navbar({ paginaAtual, setPaginaAtual }) {
  return (
    <nav style={{ padding: '15px', backgroundColor: '#1A1A1A', color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
      <h2>🏗️ ObraVoz</h2>
      <div>
        <button onClick={() => setPaginaAtual('selecao')} style={{ marginRight: '10px' }}>Turno / Obra</button>
        <button onClick={() => setPaginaAtual('relatos')}>Relatos (Diário)</button>
      </div>
    </nav>
  );
}


/** import { db, generateUUID } from '../db/db';
import { sincronizarComNuvem } from '../services/syncService';

// Dentro da Navbar:
const executarTesteSync = async () => {
  setLoading(true);
  try {
    const novoId = generateUUID();
    
    // Grava na tabela 'obras' existente no seu db.js
    await db.obras.add({
      id: novoId,
      nome_obra: 'Obra Teste - Vale do Lobo',
      status: 'em_andamento',
      synced: 0,
    });

    const res = await sincronizarComNuvem(db);

    if (res.success) {
      alert(`✅ Sucesso! Obra sincronizada com o Neon.`);
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
