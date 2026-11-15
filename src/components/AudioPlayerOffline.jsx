// src/components/AudioPlayerOffline.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../db/db';

export function AudioPlayerOffline({ diarioId }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcricao, setTranscricao] = useState('');

  useEffect(() => {
    let urlCriada = null;

    async function carregarAudio() {
      try {
        const media = await db.midias_audio.where('diario_id').equals(diarioId).first();

        if (media && media.audio_blob) {
          urlCriada = URL.createObjectURL(media.audio_blob);
          setAudioUrl(urlCriada);
          setTranscricao(media.transcricao_bruta || '');
        }
      } catch (err) {
        console.error('Erro ao carregar áudio offline:', err);
      }
    }

    carregarAudio();

    return () => {
      if (urlCriada) {
        URL.revokeObjectURL(urlCriada);
      }
    };
  }, [diarioId]);

  if (!audioUrl) {
    return <p className="audio-sem-registro">Sem gravação de áudio anexada.</p>;
  }

  return (
    <div className="audio-card-offline">
      <p className="audio-titulo">
        🎙️ Gravação do Diário:
      </p>
      
      <audio controls src={audioUrl} className="audio-player-nativo" />

      <div className="audio-transcricao-box">
        <strong className="audio-transcricao-label">Transcrição Automática:</strong>
        <p className="audio-transcricao-texto">
          "{transcricao || 'Nenhuma transcrição disponível.'}"
        </p>
      </div>
    </div>
  );
}

export default AudioPlayerOffline;
