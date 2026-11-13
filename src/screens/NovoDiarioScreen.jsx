// src/screens/NovoDiarioScreen.jsx
import React, { useState, useEffect } from 'react';
import { useClima } from '../hooks/useClima';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { salvarDiarioLocal } from '../services/diarioService'; // Ou a função que guarda no Dexie
import '../App.css';

export function NovoDiarioScreen({ obraId, userId, onDiarioSalvo }) {
  const { clima, carregando: carregandoClima } = useClima();
  const { isRecording, transcript, erroGravacao, startRecording, stopRecording } = useVoiceRecorder('pt-PT');

  const [setorPavimento, setSetorPavimento] = useState('');
  const [relato, setRelato] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [fotosBase64, setFotosBase64] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Sempre que a transcrição de voz atualiza, concatena ou preenche o relato
  useEffect(() => {
    if (transcript) {
      setRelato(prev => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  // Captura de fotos locais via input file (suporta câmara do telemóvel)
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
        obra_id: obraId || 'geral',
        user_id: userId || null,
        setor_pavimento: setorPavimento,
        clima: clima,
        textoRelato: relato,
        ocorrencias: ocorrencias,
        medicoes: [], // Pode integrar as linhas de cofragem/betão aqui
        fotosBase64: fotosBase64,
      };

      await salvarDiarioLocal(
        dadosDiario.textoRelato,
        dadosDiario.clima,
        dadosDiario.medicoes,
        dadosDiario.fotosBase64
      );

      setMensagemStatus('✅ Diário guardado com sucesso offline!');
      if (onDiarioSalvo) onDiarioSalvo();

      // Limpa o formulário após 2 segundos
      setTimeout(() => {
        setRelato('');
        setOcorrencias('');
        setSetorPavimento('');
        setFotosBase64([]);
        setMensagemStatus('');
      }, 2000);

    } catch (error) {
      console.error('Erro ao guardar diário:', error);
      setMensagemStatus('❌ Erro ao guardar o diário localmente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2 style={{ color: 'var(--blue-primary)', marginBottom: '4px', fontSize: '1.4rem' }}>
        🏗️ Registo Diário de Obra
      </h2>
      <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
        Preencha os dados do setor, dita as atividades por voz e Registe o progresso de hoje.
      </p>

      {/* Badge de Clima Automático */}
      <div className="clima-badge" style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '8px', background: '#222', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: '#ddd' }}>🌤️ Condição Atmosférica:</span>
        <strong style={{ color: '#4ade80', fontSize: '0.9rem' }}>
          {carregandoClima ? 'A detetar GPS...' : clima}
        </strong>
      </div>

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

        {/* Relato de Atividades (com Botão de Voz) */}
        <div className="campo-group" style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.9rem' }}>Relato de Atividades (Dite ou Escreva)</label>
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                background: isRecording ? '#dc2626' : '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItem: 'center',
                gap: '6px'
              }}
            >
              {isRecording ? '🔴 A gravar... (Clique para parar)' : '🎙️ Ditar por Voz'}
            </button>
          </div>

          {erroGravacao && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '4px' }}>{erroGravacao}</p>}

          <textarea
            rows="5"
            placeholder="Descreva o andamento dos trabalhos, equipas em campo, betão aplicado..."
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: '#fff', resize: 'vertical' }}
          />
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

        {/* Registo Fotográfico */}
        <div className="campo-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Registo Fotográfico da Obra</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleCapturarFoto}
            style={{ display: 'none' }}
            id="input-fotos"
          />
          <label
            htmlFor="input-fotos"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '12px',
              border: '2px dashed #555',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#ccc',
              fontSize: '0.85rem',
              background: '#1e1e1e',
              marginBottom: '10px'
            }}
          >
            📸 Adicionar Fotos (Câmara ou Galeria)
          </label>

          {/* Miniaturas das fotos */}
          {fotosBase64.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
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
          )}
        </div>

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
            cursor: 'pointer'
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
