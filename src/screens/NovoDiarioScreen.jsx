// src/screens/NovoDiarioScreen.jsx
import React, { useState, useEffect } from 'react';
import '../App.css';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { salvarAudioComTranscricao } from '../services/audioService';
import { db, generateUUID } from '../db/db';
import { formatarEPolirTexto } from '../utils/textFormatter';
import { redimensionarImagem } from '../utils/imageUtils';

export function NovoDiarioScreen({ obraId, userId, dadosTurno, onDiarioSalvo }) {
  const { isRecording, transcript, erroGravacao, startRecording, stopRecording } = useVoiceRecorder('pt-PT');
  
  // Recupera rascunho anterior do localStorage se existir
  const rascunhoSalvo = JSON.parse(localStorage.getItem('obravoz_rascunho_diario') || '{}');

  const [setorPavimento, setSetorPavimento] = useState(dadosTurno?.setorPavimento || '');
  const [relato, setRelato] = useState(rascunhoSalvo.relato || '');
  const [ocorrencias, setOcorrencias] = useState(rascunhoSalvo.ocorrencias || '');
  const [observacoes, setObservacoes] = useState(rascunhoSalvo.observacoes || '');
  const [recomendacoes, setRecomendacoes] = useState(rascunhoSalvo.recomendacoes || '');
  const [fotosBase64, setFotosBase64] = useState(rascunhoSalvo.fotosBase64 || []);
  const [salvando, setSalvando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Salva automaticamente no rascunho sempre que o utilizador alterar qualquer campo
  useEffect(() => {
    const rascunhoAtual = {
      relato,
      ocorrencias,
      observacoes,
      recomendacoes,
      fotosBase64
    };
    localStorage.setItem('obravoz_rascunho_diario', JSON.stringify(rascunhoAtual));
  }, [relato, ocorrencias, observacoes, recomendacoes, fotosBase64]);

  useEffect(() => {
    if (transcript) {
      setRelato(transcript);
    }
  }, [transcript]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      const resultado = await stopRecording();
      if (resultado && resultado.transcription) {
        setRelato(formatarEPolirTexto(resultado.transcription));
      }
      window._ultimoAudioBlob = resultado?.audioBlob;
    } else {
      startRecording();
    }
  };

  const handleBlurRelato = () => {
    if (relato) {
      setRelato(formatarEPolirTexto(relato));
    }
  };

  const handleCapturarFoto = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const fotoOtimizada = await redimensionarImagem(file, 1024, 0.75);
        setFotosBase64(prev => [...prev, fotoOtimizada]);
      } catch (err) {
        console.error("Erro ao otimizar imagem:", err);
      }
    }
  };

  const handleRemoverFoto = (index) => {
    setFotosBase64(prev => prev.filter((_, i) => i !== index));
  };

  const handleSalvarEGerarPDF = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const diarioId = generateUUID();
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

      // 1. Guarda no Dexie.js
      await db.diarios_obra.put(dadosDiario);

      // 2. Guarda o áudio se existir
      if (window._ultimoAudioBlob && window._ultimoAudioBlob.size > 0) {
        await salvarAudioComTranscricao({
          diarioId: diarioId,
          audioBlob: window._ultimoAudioBlob,
          transcricao: relatoFinal
        });
        window._ultimoAudioBlob = null;
      }

      // 3. Atualiza o array offline no localStorage
      const diariosSalvos = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      diariosSalvos.unshift(dadosDiario);
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(diariosSalvos));

      // 4. Limpa o rascunho após guardar com sucesso
      localStorage.removeItem('obravoz_rascunho_diario');

      setMensagemStatus('✅ Diário, fotos e PDF guardados com sucesso!');
      
      if (onDiarioSalvo) onDiarioSalvo(dadosDiario);

      setTimeout(() => {
        setMensagemStatus('');
      }, 3000);

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
        
        <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          RDO - Relatório Diário de Obra
        </h1>

        <div className="turno-info-resumo" style={{ background: 'rgba(22, 160, 133, 0.1)', border: '1px solid #16a085', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#ddd' }}>
          <strong style={{ color: '#16a085', display: 'block', marginBottom: '4px' }}>📋 Dados do Turno Atual:</strong>
          <span>Obra: <strong>{obraId && obraId !== 'geral' ? obraId : 'Geral'}</strong></span>
          {setorPavimento && <span style={{ marginLeft: '15px' }}>Setor/Pavimento: <strong>{setorPavimento}</strong></span>}
          {dadosTurno?.frenteServico && <span style={{ marginLeft: '15px' }}>Frente: <strong>{dadosTurno.frenteServico}</strong></span>}
        </div>

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
              onBlur={handleBlurRelato}
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
              <div className="galeria-preview" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                {fotosBase64.map((foto, index) => (
                  <div key={index} className="foto-item" style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444' }}>
                    <img src={foto} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(index)}
                      className="btn-remover-foto"
                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.7rem', cursor: 'pointer' }}
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
