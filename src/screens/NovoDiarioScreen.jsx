// src/screens/NovoDiarioScreen.jsx
import React, { useState, useEffect } from 'react';
import '../App.css';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { salvarAudioComTranscricao } from '../services/audioService';
import { db, generateUUID } from '../db/db';
import { formatarEPolirTexto } from '../utils/textFormatter'; // <-- Importa o formatador

export function NovoDiarioScreen({ obraId, userId, onDiarioSalvo }) {
  const { isRecording, transcript, erroGravacao, startRecording, stopRecording } = useVoiceRecorder('pt-PT');
  
  const [setorPavimento, setSetorPavimento] = useState('');
  const [relato, setRelato] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');
  const [fotosBase64, setFotosBase64] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Sincroniza a transcrição e aplica polimento automático leve
  useEffect(() => {
    if (transcript) {
      setRelato(transcript);
    }
  }, [transcript]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      const resultado = await stopRecording();
      if (resultado && resultado.transcription) {
        // Aplica correção ortográfica e pontuação automática ao parar de ditar
        const textoPolido = formatarEPolirTexto(resultado.transcription);
        setRelato(textoPolido);
      }
      window._ultimoAudioBlob = resultado?.audioBlob;
    } else {
      startRecording();
    }
  };

  const handleBlurRelato = () => {
    // Quando o utilizador sai do campo de texto (blur), aplica a polidela automática
    if (relato) {
      setRelato(formatarEPolirTexto(relato));
    }
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
      // Garante o texto totalmente polido e pontuado antes de salvar
      const relatoFinal = formatarEPolirTexto(relato);

      const dadosDiario = {
        id: diarioId,
        obra_id: obraId || 'geral',
        user_id: userId || null,
        setor_pavimento: setorPavimento,
        clima_manha: 'sol',
        clima_tarde: 'sol',
        relato_atividades: relatoFinal,
        ocorrencias: ocorrencias,
        observacoes: observacoes,
        recomendacoes: recomendacoes,
        fotosBase64: fotosBase64,
        data_relatorio: new Date().toISOString().slice(0, 10),
        sync_status: 'pending'
      };

      await db.diarios_obra.put(dadosDiario);

      if (window._ultimoAudioBlob && window._ultimoAudioBlob.size > 0) {
        await salvarAudioComTranscricao({
          diarioId: diarioId,
          audioBlob: window._ultimoAudioBlob,
          transcricao: relatoFinal
        });
        window._ultimoAudioBlob = null;
      }

      const diariosSalvos = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      diariosSalvos.unshift(dadosDiario);
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(diariosSalvos));

      setMensagemStatus('✅ Diário, áudio e PDF polidos e guardados com sucesso!');
      if (onDiarioSalvo) onDiarioSalvo(dadosDiario);

      setTimeout(() => {
        setRelato('');
        setOcorrencias('');
        setObservacoes('');
        setRecomendacoes('');
        setSetorPavimento('');
        setFotosBase64([]);
        setMensagemStatus('');
      }, 2500);

    } catch (error) {
      console.error('Erro ao guardar diário:', error);
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
              onBlur={handleBlurRelato} // Aplica formatação automática ao sair do campo
              required
            />

            <div className="acoes" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
              <button
                type="button"
                onClick={handleToggleRecording}
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
            {isRecording && <p style={{ color: '#16a085', fontSize: '0.8rem', textAlign: 'center' }}>🔴 A gravar áudio... Fale claramente.</p>}
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
