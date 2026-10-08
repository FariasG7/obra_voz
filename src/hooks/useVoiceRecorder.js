// src/hooks/useVoiceRecorder.js
import { useState, useRef } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    setTranscript('');
    audioChunksRef.current = [];

    // 1. Solicita acesso ao Microfone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2. Configura o MediaRecorder para capturar o áudio bruto (Blob)
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();

    // 3. Configura a SpeechRecognition API para transcrição em tempo real
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-PT'; // Ou 'pt-BR' conforme a configuração do telemóvel

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }

    setIsRecording(true);
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      // Para o Gravador de Áudio
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          // Cria o Blob final do áudio (.webm no Chrome/Android ou .mp4 no Safari/iOS)
          const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          // Desliga o microfone
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

          resolve({
            audioBlob,
            transcription: transcript
          });
        };

        mediaRecorderRef.current.stop();
      }

      // Para a Transcrição de Voz
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setIsRecording(false);
    });
  };

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording
  };
}
