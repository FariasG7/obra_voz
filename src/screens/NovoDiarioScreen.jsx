// src/screens/NovoDiarioScreen.jsx
import React, { useState, useEffect } from 'react';
import '../App.css';

export function NovoDiarioScreen({ obraId, userId, onDiarioSalvo }) {
  // Estado local para simular ou gerir gravação com segurança contra falhas do Safari
  const [isRecording, setIsRecording] = useState(false);
  const [erroGravacao, setErroGravacao] = useState('');
  
  const [setorPavimento, setSetorPavimento] = useState('');
  const [relato, setRelato] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [fotosBase64, setFotosBase64] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Tentativa segura de usar a Web Speech API nativa se suportada pelo iPad
  const startRecording = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setErroGravacao('O reconhecimento de voz não é suportado neste navegador. Escreva no campo.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-PT';
      recognition.interimResults = true;

      recognition.onstart = () => setIsRecording(true);
      recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setErroGravacao('Erro ao capturar voz. Tente novamente.');
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
      
      recognition.onresult = (event) => {
        const transcriptText = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setRelato(prev => (prev ? `${prev} ${transcriptText}` : transcriptText));
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

  // Captura de fotos locais via input file (suporta câmara do iPad/telemóvel)
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

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const dadosDiario = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        obra_id: obraId || 'geral',
        user_id: userId || null,
        setor_pavimento: setorPavimento,
        clima: 'Não registado',
        textoRelato: relato,
        ocorrencias: ocorrencias,
        medicoes: [], 
        fotosBase64: fotosBase64,
        data_relatorio: new Date().toISOString().slice(0, 10),
      };

      // Salvamento seguro direto no localStorage para evitar falhas do Dexie/IndexedDB no Safari
      const diariosSalvos = JSON.parse(localStorage.getItem('obravoz_diarios_offline') || '[]');
      diariosSalvos.unshift(dadosDiario);
      localStorage.setItem('obravoz_diarios_offline', JSON.stringify(diariosSalvos));

      setMensagemStatus('✅ Diário guardado com sucesso offline!');
      if (onDiarioSalvo) onDiarioSalvo();

      setTimeout(() => {
        setRelato('');
        setOcorrencias('');
        setSetorPavimento('');
        setFotosBase64([]);
        setMensagemStatus('');
      }, 2000);

    } catch (error) {
      console.error('Erro ao guardar diário:', error);
      setMensagemStatus('❌ Erro inesperado ao guardar o diário.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2 style={{ color: 'var(--blue-primary, #3b82f6)', marginBottom: '4px', fontSize: '1.4rem' }}>
        🏗️ Registo Diário de Obra
      </h2>
      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
        Preencha os dados do setor e relate o progresso de hoje.
      </p>

      <form onSubmit={handleSalvar} className="login-form">
        
        {/* Setor / Pavimento */}
        <div className="campo-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Setor / Pavimento</label>
          <input
            type="text"
            placeholder="Ex: Bloco A - Piso 2 (Cofragem de pilares)"
            value={setorPavimento}
            onChange={(e) => setSetorPavimento(e.target.value)}
            required
            className="login-input"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: '#fff' }}
          />
        </div>

        {/* Relato de Atividades & Botões Circulares de Ação */}
        <div className="campo-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Relate o trabalho de hoje...</label>
          
          <textarea
            rows="5"
            placeholder="Descreva o andamento dos trabalhos, equipas em campo, betão aplicado..."
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: '#fff', resize: 'vertical', marginBottom: '12px' }}
          />

          {/* Barra de Ações Rápidas (Microfone, Câmera) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            
            {/* Botão de Microfone com Animação de Gravação */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? "A gravar... Clique para parar" : "Ditar por voz"}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isRecording ? '#dc2626' : '#222',
                border: isRecording ? '2px solid #f87171' : '1px solid #555',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                boxShadow: isRecording ? '0 0 12px rgba(220, 38, 38, 0.7)' : 'none'
              }}
            >
              {isRecording ? '⏹️' : '🎙️'}
            </button>

            {/* Input de Arquivo Oculto para Fotos */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCapturarFoto}
              style={{ display: 'none' }}
              id="input-fotos-circular"
            />
            
            {/* Botão Circular de Câmera */}
            <label
              htmlFor="input-fotos-circular"
              title="Adicionar Fotos"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#222',
                border: '1px solid #555',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              📸
            </label>
          </div>

          {erroGravacao && <p style={{ color: '#f87171', fontSize: '0.8rem', textAlign: 'center', marginTop: '4px' }}>{erroGravacao}</p>}
          {isRecording && <p style={{ color: '#4ade80', fontSize: '0.8rem', textAlign: 'center', marginTop: '4px' }}>🔴 A gravar áudio... Fale claramente.</p>}
        </div>

        {/* Ocorrências / Imprevistos */}
        <div className="campo-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Ocorrências / Imprevistos (Opcional)</label>
          <input
            type="text"
            placeholder="Ex: Atraso na chegada da betonadeira devido ao trânsito"
            value={ocorrencias}
            onChange={(e) => setOcorrencias(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: '#fff' }}
          />
        </div>

        {/* Miniaturas das fotos adicionadas */}
        {fotosBase64.length > 0 && (
          <div className="campo-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Fotos Anexadas ({fotosBase64.length})</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {fotosBase64.map((foto, index) => (
                <div key={index} style={{ position: 'relative', width: '70px', height: '70px' }}>
                  <img
                    src={foto}
                    alt={`Preview ${index}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #444' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoverFoto(index)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão Submeter */}
        <button
          type="submit"
          disabled={salvando}
          className="btn-finalizar"
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--blue-primary, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {salvando ? 'A guardar no dispositivo...' : '💾 Guardar Diário Offline'}
        </button>
      </form>

      {mensagemStatus && (
        <div style={{ marginTop: '15px', textAlign: 'center', padding: '10px', borderRadius: '6px', background: '#222', border: '1px solid #444', fontSize: '0.9rem' }}>
          {mensagemStatus}
        </div>
      )}
    </div>
  );
}

export default NovoDiarioScreen;
