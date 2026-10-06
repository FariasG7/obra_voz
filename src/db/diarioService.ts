import { db, DiarioObra, FotoRegistro } from './db';

// --- SALVAR RELATÓRIO COMPLETO ---
export async function salvarDiarioLocal(
  textoRelato: string, 
  clima: string, 
  medicoes: any[], 
  fotosBase64: string[]
) {
  const dataHoje = new Date().toISOString().slice(0, 10);

  // 1. Guarda o registo do diário
  const diarioId = await db.diarios.add({
    data: dataHoje,
    textoRelato,
    clima,
    medicoes,
    sincronizado: false,
    criadoEm: new Date()
  });

  // 2. Converte as fotos Base64 em Blob e guarda na tabela 'fotos'
  for (const base64 of fotosBase64) {
    const res = await fetch(base64);
    const blob = await res.blob();
    
    await db.fotos.add({
      diarioId,
      blob,
      criadoEm: new Date()
    });
  }

  return diarioId;
}

// --- RECUPERAR RELATÓRIO DE HOJE ---
export async function obterDiarioHoje(): Promise<DiarioObra | undefined> {
  const dataHoje = new Date().toISOString().slice(0, 10);
  return await db.diarios.where('data').equals(dataHoje).first();
}

// --- RECUPERAR FOTOS DO DIÁRIO ---
export async function obterFotosDoDiario(diarioId: number): Promise<FotoRegistro[]> {
  return await db.fotos.where('diarioId').equals(diarioId).toArray();
}
