import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️ VITE_NEON_DATABASE_URL não configurada no .env');
}

export const sql = neon(DATABASE_URL);