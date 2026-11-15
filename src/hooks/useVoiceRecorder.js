// src/hooks/useVoiceRecorder.js
import { useState, useRef } from 'react';

export function useVoiceRecorder(idioma = 'pt-PT') {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [erroGravacao, setErroGravacao] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  
  // Guardamos o texto definitivo já confirmado pelo motor de voz
  const finalTranscriptRef = useRef('');

  const startRecording = async () => {
    setTranscript('');
    finalTranscriptRef.current = '';
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

      mediaRecorder.start(250);

      // 3. Configura a SpeechRecognition API para transcrição em tempo real
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = idioma;

        recognition.onresult = (event) => {
          let interimText = '';

          // Percorre os resultados sem duplicar o histórico acumulado
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalTranscriptRef.current += ' ' + item[0].transcript.trim();
            } else {
              interimText += item[0].transcript;
            }
          }

          // Junta o texto definitivo com o texto interino atual da fala
          const textoCompleto = (finalTranscriptRef.current + ' ' + interimText).trim();
          setTranscript(textoCompleto);
        };

        recognition.onerror = (event) => {
          console.warn("Aviso no reconhecimento de voz:", event.error);
        };

        recognition.onend = () => {
          // Se ainda estiver a gravar mas o recognition parou sozinho (comum em pausas longas), reinicia se necessário
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Ignora se já estiver ativo
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        console.warn("SpeechRecognition não suportado neste navegador.");
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
      // Para a Transcrição de Voz primeiro
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null; // Remove o restart automático
          recognitionRef.current.stop();
        } catch (e) {
          // Ignora se já estiver parado
        }
      }

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
