// src/screens/NovoDiarioScreen.jsx
import React, { useState, useRef } from 'react';
import '../App.css';
import { salvarAudioComTranscricao } from '../services/audioService';
import { db, generateUUID } from '../db/db';

export function NovoDiarioScreen({ obraId, userId, onDiarioSalvo }) {
  const [isRecording, setIsRecording] = useState(false);
  const [erroGravacao, setErroGravacao] = useState('');
  
  const [setorPavimento, setSetorPavimento] = useState('');
  const [relato, setRelato] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');
  const [fotosBase64, setFotosBase64] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Refs para controlo de voz e áudio binário (Blob)
  const finalTranscriptRef = useRef('');
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);

  // Iniciar Gravação (Áudio Blob + Reconhecimento de Voz sem duplicações)
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      audioBlobRef.current = null;

      // 1. Captura o fluxo de microfone para o Blob de áudio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioBlobRef.current = audioBlob;
        // Liberta os tracks do microfone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);

      // 2. Configura a SpeechRecognition API para transcrição em tempo real (sem duplicações)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        finalTranscriptRef.current = relato ? relato + ' ' : '';
        setErroGravacao('');

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-PT';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
          let interimText = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalTranscriptRef.current += ' ' + item[0].transcript.trim();
            } else {
              interimText += item[0].transcript;
            }
          }

          const textoCompleto = (finalTranscriptRef.current + ' ' + interimText).trim();
          setRelato(textoCompleto);
        };

        recognition.onerror = (event) => {
          console.warn('Aviso no reconhecimento de voz:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        setErroGravacao('Reconhecimento de voz não suportado neste navegador. O áudio será gravado.');
      }

      setIsRecording(true);
    } catch (e) {
      console.error('Erro ao aceder ao microfone:', e);
      setErroGravacao('Não foi possível aceder ao microfone. Verifique as permissões.');
      setIsRecording(false);
    }
  };

  // Parar Gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignora se já estiver parado
      }
    }

    setIsRecording(false);
  };

  const handleCapturarFoto = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotosBase64(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoverFoto = (index) => {
    setFotosBase64(prev => prev.filter((_, i) => i !== index));
  };

  const handleSalvarEGerarPDF = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const diarioId = generateUUID();

      const dadosDiario = {
        id: diarioId,
        obra_id: obraId || 'geral',
        user_id: userId || null,
        setor_pavimento: setorPavimento,
        clima_manha: 'sol',
        clima_tarde: 'sol',
        relato_atividades: relato,
        ocorrencias: ocorrencias,
        observacoes: observacoes,
        recomendacoes: recomendacoes,
        fotosBase64: fotosBase64,
        data_relatorio: new Date().toISOString().slice(0, 10),
        sync_status: 'pending'
      };

      // 1. Salva o diário no Dexie.js (tabela diarios_obra)
      await db.diarios_obra.put(dadosDiario);

      // 2. Se houver áudio gravado, guarda utilizando o audioService
      if (audioBlobRef.current && audioBlobRef.current.size > 0) {
        await salvarAudioComTranscricao({
          diarioId: diarioId,
          audioBlob: audioBlobRef.current,
          transcricao: relato
        });
      }

      // Salvamento complementar no localStorage para garantir compatibilidade total no Safari/iPad
      const diariosSalvos = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      diariosSalvos.unshift(dadosDiario);
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(diariosSalvos));

      setMensagemStatus('✅ Diário, áudio e PDF guardados com sucesso!');
      if (onDiarioSalvo) onDiarioSalvo(dadosDiario);

      setTimeout(() => {
        setRelato('');
        setOcorrencias('');
        setObservacoes('');
        setRecomendacoes('');
        setSetorPavimento('');
        setFotosBase64([]);
        audioBlobRef.current = null;
        setMensagemStatus('');
      }, 2500);

    } catch (error) {
      console.error('Erro ao guardar diário e áudio:', error);
      setMensagemStatus('❌ Erro inesperado ao guardar o registo.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="content diario-content-wrapper">
      <div className="card diario-form-card">
        
        {!obraId || obraId === 'geral' ? (
          <div className="diario-alerta-aviso">
            ⚠️ Nenhuma obra específica selecionada. O registo ficará como geral.
          </div>
        ) : null}

        <form onSubmit={handleSalvarEGerarPDF}>
          
          <div className="campo-group">
            <label>Relato das Atividades: *</label>
            <textarea
              className="textarea"
              placeholder="Digite ou utilize o microfone para ditar o relato..."
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
              required
            />

            <div className="acoes" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`icon-btn btn-mic ${isRecording ? 'recording' : ''}`}
                title={isRecording ? "A gravar... Clique para parar" : "Ditar relato por voz"}
              >
                {isRecording ? '⏹️' : '🎙️'}
              </button>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleCapturarFoto}
                style={{ display: 'none' }}
                id="input-fotos-anexo"
              />
              
              <label
                htmlFor="input-fotos-anexo"
                className="icon-btn btn-cam"
                title="Adicionar Fotos da Obra"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                📸
              </label>
            </div>

            {erroGravacao && <p style={{ color: '#ff6b81', fontSize: '0.8rem', textAlign: 'center' }}>{erroGravacao}</p>}
            {isRecording && <p style={{ color: '#16a085', fontSize: '0.8rem', textAlign: 'center' }}>🔴 A gravar áudio e a transcrever... Fale claramente.</p>}
          </div>

          <div className="campo-group">
            <label>Ocorrências / Imprevistos:</label>
            <input
              type="text"
              placeholder="Atrasos em materiais, quebra de máquinas, chuva..."
              value={ocorrencias}
              onChange={(e) => setOcorrencias(e.target.value)}
            />
          </div>

          <div className="diario-grid-duplo">
            <div className="campo-group">
              <label>Observações:</label>
              <input
                type="text"
                placeholder="Notas gerais do dia..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            <div className="campo-group">
              <label>Recomendações:</label>
              <input
                type="text"
                placeholder="Instruções para o próximo turno..."
                value={recomendacoes}
                onChange={(e) => setRecomendacoes(e.target.value)}
              />
            </div>
          </div>

          {fotosBase64.length > 0 && (
            <div className="campo-group">
              <label>Fotos Anexadas ({fotosBase64.length})</label>
              <div className="galeria-preview">
                {fotosBase64.map((foto, index) => (
                  <div key={index} className="foto-item">
                    <img src={foto} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(index)}
                      className="btn-remover-foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="btn-guardar-diario"
          >
            {salvando ? '⏳ A processar registo...' : 'Guardar Diário, Anexar Áudio & Gerar PDF'}
          </button>
        </form>

        {mensagemStatus && (
          <div style={{ marginTop: '15px', textAlign: 'center', padding: '10px', borderRadius: '8px', background: '#222', border: '1px solid #333', fontSize: '0.85rem' }}>
            {mensagemStatus}
          </div>
        )}

      </div>
    </div>
  );
}

export default NovoDiarioScreen;
