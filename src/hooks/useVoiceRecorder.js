// src/hooks/useVoiceRecorder.js
import { useState, useRef, useCallback } from 'react';

export function useVoiceRecorder(idioma = 'pt-PT') {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [erroGravacao, setErroGravacao] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    setTranscript('');
    setErroGravacao(null);
    audioChunksRef.current = [];

    try {
      // 1. Solicita acesso ao Microfone com tratamento de erro
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Configura o MediaRecorder para capturar o áudio bruto (Blob)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // Recolhe chunks a cada 250ms para evitar perda se houver crash

      // 3. Configura a SpeechRecognition API para transcrição em tempo real
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = idioma;

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
          console.warn("Aviso no reconhecimento de voz:", event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        console.warn("SpeechRecognition não suportado neste navegador (ex: Firefox mobile). O áudio será gravado, mas sem transcrição em tempo real.");
      }

      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao aceder ao microfone:", error);
      setErroGravacao("Não foi possível aceder ao microfone. Verifique as permissões.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      // Para o Gravador de Áudio
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          // Desliga o microfone libertando o hardware
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

          resolve({
            audioBlob,
            transcription: transcript
          });
        };

        mediaRecorderRef.current.stop();
      } else {
        resolve({
          audioBlob: new Blob([], { type: 'audio/webm' }),
          transcription: transcript
        });
      }

      // Para a Transcrição de Voz
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignora se já estiver parado
        }
      }

      setIsRecording(false);
    });
  };

  return {
    isRecording,
    transcript,
    erroGravacao,
    startRecording,
    stopRecording
  };
}
