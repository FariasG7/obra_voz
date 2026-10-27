// src/db/db.js
import Dexie from 'dexie';

export const db = new Dexie('ObraVozDB');

db.version(1).stores({
  obras: 'id, nome_obra, status, synced',
  diarios_obra: 'id, obra_id, data, synced',
  midias_audio: 'id, diario_id, synced',
  usuarios: '++id, email, permissao'
});

/**
 * Função utilitária para gerar UUID v4 no frontend
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
