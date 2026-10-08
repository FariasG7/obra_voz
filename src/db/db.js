// src/db/db.js
import Dexie from 'dexie';

export const db = new Dexie('ObraVozDB');

// Definimos a versão do esquema com os índices essenciais para consultas rápidas
db.version(2).stores({
  obras: 'id, user_id, nome_obra, status',
  diarios_obra: 'id, obra_id, user_id, data_relatorio, sync_status',
  midias_audio: 'id, diario_id, criado_em'
});

/**
 * Função utilitária para gerar UUID v4 no frontend (sem depender de conexões externas)
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
