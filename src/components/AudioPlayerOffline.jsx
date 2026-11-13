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
        // Busca o registo de mídia no IndexedDB pelo ID do Diário
        const media = await db.midias_audio.where('diario_id').equals(diarioId).first();

        if (media && media.audio_blob) {
          // Converte o Blob binário num URL reproduzível pelo HTML5 Audio Player
          urlCriada = URL.createObjectURL(media.audio_blob);
          setAudioUrl(urlCriada);
          setTranscricao(media.transcricao_bruta || '');
        }
      } catch (err) {
        console.error('Erro ao carregar áudio offline:', err);
      }
    }

    carregarAudio();

    // Revoga a URL ao desmontar a componente para economizar RAM
    return () => {
      if (urlCriada) {
        URL.revokeObjectURL(urlCriada);
      }
    };
  }, [diarioId]);

  if (!audioUrl) {
    return <p style={{ color: '#888', fontSize: '0.9rem' }}>Sem gravação de áudio anexada.</p>;
  }

  return (
    <div style={{ 
      background: 'var(--card-bg, #1E1E1E)', 
      border: '1px solid var(--border, #2C2C2C)', 
      borderRadius: '12px', 
      padding: '15px', 
      marginTop: '10px' 
    }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--blue-light, #5AB3D4)', marginBottom: '10px', textTransform: 'uppercase' }}>
        🎙️ Gravação do Diário:
      </p>
      
      {/* Player Nativo */}
      <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '10px', outline: 'none' }} />

      {/* Exibição do Texto Transcrito */}
      <div style={{ 
        background: '#252525', 
        border: '1px solid #333', 
        borderRadius: '8px', 
        padding: '10px', 
        fontSize: '0.85rem', 
        color: '#ccc' 
      }}>
        <strong style={{ color: '#fff' }}>Transcrição Automática:</strong>
        <p style={{ fontStyle: 'italic', marginTop: '4px', color: '#aaa' }}>
          "{transcricao || 'Nenhuma transcrição disponível.'}"
        </p>
      </div>
    </div>
  );
}
