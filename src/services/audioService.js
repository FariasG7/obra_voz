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

/**
 * Recupera o Blob de áudio associado a um diário para reprodução
 */
export async function obterAudioParaReproducao(diarioId) {
  const registo = await db.midias_audio.where('diario_id').equals(diarioId).first();
  if (!registo || !registo.audio_blob) return null;

  // Cria um Object URL para o elemento <audio src="..." controls />
  return URL.createObjectURL(registo.audio_blob);
}
