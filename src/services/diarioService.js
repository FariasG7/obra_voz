// src/services/diarioService.js
import { db } from '../db/db';

export async function salvarDiarioLocal(dadosDiario) {
  try {
    const id = dadosDiario.id || crypto.randomUUID();
    await db.diarios_obra.put({
      id,
      ...dadosDiario,
      synced: 0, // Marca como pendente para o Sync Engine
      updated_at: new Date().toISOString()
    });
    return { success: true, id };
  } catch (error) {
    console.error('Erro ao salvar diário no Dexie:', error);
    return { success: false, error: error.message };
  }
}
