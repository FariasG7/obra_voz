import Dexie, { Table } from 'dexie';

export interface LinhaMedicao {
  id: number | string;
  tipo: 'cofragem' | 'betao';
  nome: string;        // Pilar, Parede, Laje, etc.
  quantidade: number;  
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

export interface UsuarioAutorizado {
  id?: number;
  nome: string;
  email: string;
  permissao: 'leitor' | 'editor';
  criadoEm: Date;
}

export class ObraVozDatabase extends Dexie {
  diarios!: Table<DiarioObra>;
  fotos!: Table<FotoRegistro>;
  usuarios!: Table<UsuarioAutorizado>; // Tabela de Usuários/Permissões

  constructor() {
    super('ObraVozDB');
    
    // Versão 1 inicial
    this.version(1).stores({
      diarios: '++id, data, sincronizado',
      fotos: '++id, diarioId'
    });

    // Versão 2: Adicionada tabela de usuários autorizados
    this.version(2).stores({
      diarios: '++id, data, sincronizado',
      fotos: '++id, diarioId',
      usuarios: '++id, &email, permissao' // '&email' impede e-mails duplicados
    });
  }
}

export const db = new ObraVozDatabase();
