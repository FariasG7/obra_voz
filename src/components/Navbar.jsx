import { db, generateUUID } from '../db/db';
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
