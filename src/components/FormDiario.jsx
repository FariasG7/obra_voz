// src/components/FormDiario.jsx
import React, { useState, useEffect } from 'react';
import { useObraVozDB } from '../hooks/useObraVozDB';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import jsPDF from 'jspdf';

export function FormDiario() {
  const { salvarDiarioOffline } = useObraVozDB();
  const { isRecording, transcript, erroGravacao, startRecording, stopRecording } = useVoiceRecorder('pt-PT');

  const [sessao, setSessao] = useState(null);
  const [relato, setRelato] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');
  const [audioBlobSalvo, setAudioBlobSalvo] = useState(null);

  useEffect(() => {
    const sessaoGuardada = localStorage.getItem('obravoz_sessao_ativa');
    if (sessaoGuardada) {
      setSessao(JSON.parse(sessaoGuardada));
    }
  }, []);

  // Atualiza o relato automaticamente conforme a transcrição por voz vai acontecendo
  useEffect(() => {
    if (transcript) {
      setRelato(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  }, [transcript]);

  // Controlar o clique do botão de microfone
  const handleToggleGravacao = async () => {
    if (isRecording) {
      const resultado = await stopRecording();
      if (resultado.audioBlob && resultado.audioBlob.size > 0) {
        setAudioBlobSalvo(resultado.audioBlob);
      }
    } else {
      setAudioBlobSalvo(null);
      await startRecording();
    }
  };

  const gerarPDFRelatorio = (dadosRelatorio) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(42, 161, 192);
    doc.text("ObraVoz - Registo Diário de Obra (RDO)", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 14, 28);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Obra: ${sessao?.nomeObra || 'Não especificada'}`, 14, 40);
    doc.text(`Setor / Pavimento: ${dadosRelatorio.setor_pavimento || 'N/A'}`, 14, 48);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Relato das Atividades:", 14, 60);
    doc.setFont("helvetica", "normal");
    
    const splitRelato = doc.splitTextToSize(dadosRelatorio.relato_atividades || 'Sem relato.', 180);
    doc.text(splitRelato, 14, 68);

    let posY = 68 + (splitRelato.length * 6) + 10;

    if (dadosRelatorio.ocorrencias) {
      doc.setFont("helvetica", "bold");
      doc.text("Ocorrências / Imprevistos:", 14, posY);
      doc.setFont("helvetica", "normal");
      const splitOcorrencias = doc.splitTextToSize(dadosRelatorio.ocorrencias, 180);
      doc.text(splitOcorrencias, 14, posY + 8);
      posY += 15 + (splitOcorrencias.length * 6);
    }

    if (dadosRelatorio.observacoes) {
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", 14, posY);
      doc.setFont("helvetica", "normal");
      const splitObs = doc.splitTextToSize(dadosRelatorio.observacoes, 180);
      doc.text(splitObs, 14, posY + 8);
      posY += 15 + (splitObs.length * 6);
    }

    doc.save(`RDO_${sessao?.nomeObra || 'Obra'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessao || !sessao.obraId) {
      alert('Nenhuma obra ativa selecionada. Volte à página inicial e selecione o canteiro.');
      return;
    }

    const payloadDiario = {
      obra_id: sessao.obraId,
      setor_pavimento: sessao.setorPavimento,
      colaboradores_nomes: sessao.colaboradores || [],
      relato_atividades: relato,
      ocorrencias: ocorrencias,
      observacoes: observacoes,
      recomendacoes: recomendacoes,
      transcricao_bruta: relato,
      audio_blob: audioBlobSalvo
    };

    // 1. Salva no IndexedDB (incluindo o Blob de áudio e transcrição)
    await salvarDiarioOffline(payloadDiario);

    // 2. Gera o PDF imediatamente
    gerarPDFRelatorio(payloadDiario);

    alert('✅ Diário salvo com sucesso, áudio anexado e PDF gerado!');

    // Limpa os campos
    setRelato('');
    setOcorrencias('');
    setObservacoes('');
    setRecomendacoes('');
    setAudioBlobSalvo(null);
  };

  return (
    <div className="content space-y-4 diario-content-wrapper">
      {sessao ? (
        <div className="card diario-sessao-card">
          <div className="diario-sessao-header">
            <span className="diario-sessao-tag">Contexto da Obra</span>
            <span className="diario-sessao-data">
              {new Date().toLocaleDateString('pt-PT')}
            </span>
          </div>
          <h2 className="diario-sessao-titulo">{sessao.nomeObra || 'Obra sem nome'}</h2>
          <p className="diario-sessao-texto">
            <strong>Setor:</strong> {sessao.setorPavimento || 'Não especificado'}
          </p>
          <p className="diario-sessao-texto">
            <strong>Equipa ({sessao.colaboradores?.length || 0}):</strong>{' '}
            {sessao.colaboradores?.length > 0
              ? sessao.colaboradores.join(', ')
              : 'Nenhum colaborador registrado'}
          </p>
        </div>
      ) : (
        <div className="diario-alerta-aviso">
          <p>Nenhuma obra foi selecionada para o turno atual.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4 diario-form-card">
        
        {erroGravacao && (
          <div className="login-erro" style={{ marginBottom: '10px' }}>
            {erroGravacao}
          </div>
        )}

        <div className="campo-group">
          <label>Relato das Atividades: *</label>
          <textarea
            rows={4}
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            required
            placeholder="Digite ou utilize o microfone para ditar o relato..."
            className="textarea diario-textarea"
          />
        </div>

        {/* Botão de Gravação por Voz Circular (Integrado com as classes do app.css) */}
        <div className="acoes">
          <button
            type="button"
            className={`icon-btn btn-mic ${isRecording ? 'recording' : ''}`}
            onClick={handleToggleGravacao}
            title={isRecording ? "Parar Gravação" : "Iniciar Gravação por Voz"}
          >
            🎙️
          </button>
        </div>

        {isRecording && (
          <p style={{ textAlign: 'center', color: 'var(--red)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            🔴 A gravar e transcrever áudio em tempo real...
          </p>
        )}

        <div className="campo-group">
          <label>Ocorrências / Imprevistos:</label>
          <textarea
            rows={2}
            value={ocorrencias}
            onChange={(e) => setOcorrencias(e.target.value)}
            placeholder="Atrasos em materiais, quebra de máquinas, chuva..."
            className="textarea diario-textarea"
          />
        </div>

        <div className="diario-grid-duplo">
          <div className="campo-group">
            <label>Observações:</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas gerais do dia..."
              className="textarea diario-textarea"
            />
          </div>
          <div className="campo-group">
            <label>Recomendações:</label>
            <textarea
              rows={2}
              value={recomendacoes}
              onChange={(e) => setRecomendacoes(e.target.value)}
              placeholder="Instruções para o próximo turno..."
              className="textarea diario-textarea"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-guardar-diario"
        >
          Guardar Diário, Anexar Áudio & Gerar PDF
        </button>
      </form>
    </div>
  );
}

export default FormDiario;
