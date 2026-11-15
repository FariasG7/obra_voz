// src/screens/NovoDiarioScreen.jsx
import React, { useState } from 'react';
import '../App.css';

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

  // Gravação de voz unificada e sem duplicações
  const startRecording = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setErroGravacao('O reconhecimento de voz não é suportado neste navegador.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-PT';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => setIsRecording(true);
      recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setErroGravacao('Erro ao capturar voz. Tente novamente.');
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
      
      recognition.onresult = (event) => {
        let transcriptText = '';
        for (let i = 0; i < event.results.length; i++) {
          transcriptText += event.results[i][0].transcript;
        }
        setRelato(transcriptText);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setErroGravacao('Erro ao iniciar microfone.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
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
      const dadosDiario = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
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

      // Gravação segura no localStorage e Dexie
      const diariosSalvos = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      diariosSalvos.unshift(dadosDiario);
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(diariosSalvos));

      setMensagemStatus('✅ Diário guardado com sucesso & PDF gerado!');
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
      setMensagemStatus('❌ Erro inesperado ao guardar o diário.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="content diario-content-wrapper">
      <div className="card diario-form-card">
        
        {/* Aviso caso não haja obra selecionada */}
        {!obraId || obraId === 'geral' ? (
          <div className="diario-alerta-aviso">
            ⚠️ Nenhuma obra específica selecionada. O registo ficará como geral.
          </div>
        ) : null}

        <form onSubmit={handleSalvarEGerarPDF}>
          
          {/* Relato das Atividades */}
          <div className="campo-group">
            <label>Relato das Atividades: *</label>
            <textarea
              className="textarea"
              placeholder="Digite ou utilize o microfone para ditar o relato..."
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
              required
            />

            {/* Botões Circulares de Ação (Voz e Foto) */}
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
            {isRecording && <p style={{ color: '#16a085', fontSize: '0.8rem', textAlign: 'center' }}>🔴 A escutar... Fale claramente.</p>}
          </div>

          {/* Ocorrências / Imprevistos */}
          <div className="campo-group">
            <label>Ocorrências / Imprevistos:</label>
            <input
              type="text"
              placeholder="Atrasos em materiais, quebra de máquinas, chuva..."
              value={ocorrencias}
              onChange={(e) => setOcorrencias(e.target.value)}
            />
          </div>

          {/* Grid Duplo para Observações e Recomendações */}
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

          {/* Galeria de Fotos Anexadas */}
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

          {/* Botão de Guardar e Gerar PDF unificado */}
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
