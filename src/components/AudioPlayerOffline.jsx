// src/components/AudioPlayerOffline.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../db/db';

export function AudioPlayerOffline({ diarioId }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcricao, setTranscricao] = useState('');

  useEffect(() => {
    async function carregarAudio() {
      // Busca o registo de mídia no IndexedDB pelo ID do Diário
      const media = await db.midias_audio.where('diario_id').equals(diarioId).first();

      if (media && media.audio_blob) {
        // Converte o Blob binário num URL reproduzível pelo HTML5 Audio Player
        const url = URL.createObjectURL(media.audio_blob);
        setAudioUrl(url);
        setTranscricao(media.transcricao_bruta);
      }
    }

    carregarAudio();

    // Revoga a URL ao desmontar a componente para economizar RAM
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [diarioId]);

  if (!audioUrl) return <p className="text-gray-500">Sem gravação de áudio anexada.</p>;

  return (
    <div className="p-3 bg-gray-100 rounded-lg space-y-2">
      <p className="text-sm font-semibold text-gray-700">Gravação do Diário:</p>
      
      {/* Player Nativo */}
      <audio controls src={audioUrl} className="w-full" />

      {/* Exibição do Texto Transcrito */}
      <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
        <strong>Transcrição Automática:</strong>
        <p className="italic mt-1">"{transcricao || 'Nenhuma transcrição disponível.'}"</p>
      </div>
    </div>
  );
}
