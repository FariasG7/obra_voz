// src/services/audioService.js
import { db, generateUUID } from '../db/db';

export async function salvarAudioComTranscricao({ diarioId, audioBlob, transcricao }) {
  const mediaRecord = {
    id: generateUUID(),
    diario_id: diarioId,
    audio_blob: audioBlob,              // Salva o Blob binário diretamente no IndexedDB
    transcricao_bruta: transcricao,     // Texto gerado pela SpeechRecognition
    mime_type: audioBlob.type,          // Ex: "audio/webm"
    tamanho_bytes: audioBlob.size,
    criado_em: new Date().toISOString()
  };

  await db.midias_audio.put(mediaRecord);
  return mediaRecord.id;
}
