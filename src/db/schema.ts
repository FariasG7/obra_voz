import Dexie, { Table } from 'dexie';

export interface LinhaMedicao {
  id: number | string;
  tipo: 'cofragem' | 'betao';
  nome: string;        // Pilar, Parede, Laje, etc.
  quantidade: number;  // Novo campo de quantidade
  largura: number | string;
  altura: number | string;
  comprimento: number | string;
}

export interface FotoRegistro {
  id?: number;
  diarioId?: number | string;
  blob: Blob;          // Guardado como Blob no IndexedDB
  criadoEm: Date;
}

export interface DiarioObra {
  id?: number;
  data: string;        // Formato YYYY-MM-DD
  textoRelato: string;
  clima: string;
  medicoes: LinhaMedicao[];
  sincronizado: boolean;
  criadoEm: Date;
}

export class ObraVozDatabase extends Dexie {
  diarios!: Table<DiarioObra>;
  fotos!: Table<FotoRegistro>;

  constructor() {
    super('ObraVozDB');
    
    // Definição das tabelas e chaves de índice
    this.version(1).stores({
      diarios: '++id, data, sincronizado',
      fotos: '++id, diarioId'
    });
  }
}

export const db = new ObraVozDatabase();
