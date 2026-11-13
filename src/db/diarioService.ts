import { db, DiarioObra, FotoRegistro } from './db';

// --- SALVAR OU ATUALIZAR RELATÓRIO COMPLETO (ATÓMICO) ---
export async function salvarDiarioLocal(
  textoRelato: string,
  clima: string,
  medicoes: any[],
  fotosBase64: string[],
  diarioIdExistente?: number
): Promise<number> {
  // Garante a data local correta (evita desfasamento de fuso horário UTC perto da meia-noite)
  const hoje = new Date();
  const dataHoje = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  // Transação garante que ou guarda o texto + todas as fotos, ou não guarda nada
  return await db.transaction('rw', db.diarios, db.fotos, async () => {
    let diarioId: number;

    if (diarioIdExistente) {
      // Atualiza o registo existente do dia e marca como pendente de sincronização
      await db.diarios.update(diarioIdExistente, {
        textoRelato,
        clima,
        medicoes,
        sincronizado: false,
        atualizadoEm: new Date(),
      });
      diarioId = diarioIdExistente;
    } else {
      // Cria um novo registo
      diarioId = await db.diarios.add({
        data: dataHoje,
        textoRelato,
        clima,
        medicoes,
        sincronizado: false,
        criadoEm: new Date(),
      });
    }

    // Converte todas as novas fotos Base64 em Blob em paralelo e guarda em lote (bulkAdd)
    if (fotosBase64.length > 0) {
      const fotosParaSalvar: Omit<FotoRegistro, 'id'>[] = await Promise.all(
        fotosBase64.map(async (base64) => {
          const res = await fetch(base64);
          const blob = await res.blob();
          return {
            diarioId,
            blob,
            sincronizado: false, // Útil para subir as fotos para o Storage em nuvem separadamente
            criadoEm: new Date(),
          };
        })
      );

      await db.fotos.bulkAdd(fotosParaSalvar);
    }

    return diarioId;
  });
}

// --- RECUPERAR RELATÓRIO DE HOJE ---
export async function obterDiarioHoje(): Promise<DiarioObra | undefined> {
  const hoje = new Date();
  const dataHoje = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  return await db.diarios.where('data').equals(dataHoje).first();
}

// --- RECUPERAR FOTOS DO DIÁRIO (COM URLs PRONTAS PARA EXIBIÇÃO) ---
export async function obterFotosDoDiario(diarioId: number): Promise<(FotoRegistro & { previewUrl: string })[]> {
  const fotos = await db.fotos.where('diarioId').equals(diarioId).toArray();
  
  // Gera URLs temporárias em memória para renderizar nas tags <img> sem converter de volta para Base64
  return fotos.map((foto) => ({
    ...foto,
    previewUrl: URL.createObjectURL(foto.blob),
  }));
}
