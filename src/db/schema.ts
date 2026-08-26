import Dexie, { Table } from 'dexie';

export interface LinhaMedicao {
  id?: string;
  elemento: string; // Peça ou Elemento (Ex: P1, Laje 1)
  largura: number;
  altura: number;
  comprimento: number;
}

export interface FotoRegistro {
  id?: string;
  diarioId?: string;
  blob: Blob;       // Blob bruto mantido no IndexedDB sem limite de 5MB
  criadoEm: Date;
}

export interface DiarioObra {
  id?: string;
  data: string;     // Formato YYYY-MM-DD
  textoRelato: string;
  clima: string;
  cofragem: LinhaMedicao[];
  betao: LinhaMedicao[];
  sincronizado: boolean;
}

export class ObraVozDatabase extends Dexie {
  diarios!: Table<DiarioObra>;
  fotos!: Table<FotoRegistro>;

  constructor() {
    super('ObraVozDB');
    this.version(1).stores({
      diarios: '++id, data, sincronizado',
      fotos: '++id, diarioId'
    });
  }
}

export const db = new ObraVozDatabase();
