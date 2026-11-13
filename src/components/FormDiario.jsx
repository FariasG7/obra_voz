// src/components/FormDiario.jsx
import React, { useState, useEffect } from 'react';
import { useObraVozDB } from '../hooks/useObraVozDB';

export function FormDiario() {
  const { salvarDiarioOffline } = useObraVozDB();

  // Estado para armazenar o contexto do turno (Obra, Setor e Equipe)
  const [sessao, setSessao] = useState(null);

  // Estados dos relatos do diário
  const [relato, setRelato] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');

  // Carrega os dados definidos na tela inicial (SelecaoObraPage)
  useEffect(() => {
    const sessaoGuardada = localStorage.getItem('obravoz_sessao_ativa');
    if (sessaoGuardada) {
      setSessao(JSON.parse(sessaoGuardada));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessao || !sessao.obraId) {
      alert('Nenhuma obra ativa selecionada. Volte à página inicial e selecione o canteiro.');
      return;
    }

    await salvarDiarioOffline({
      obra_id: sessao.obraId,
      setor_pavimento: sessao.setorPavimento,
      colaboradores_nomes: sessao.colaboradores || [],
      relato_atividades: relato,
      ocorrencias: ocorrencias,
      observacoes: observacoes,
      recomendacoes: recomendacoes,
    });

    alert('Diário salvo com sucesso no dispositivo (Offline)!');

    // Limpa apenas os campos de texto após salvar
    setRelato('');
    setOcorrencias('');
    setObservacoes('');
    setRecomendacoes('');
  };

  return (
    <div className="content space-y-4" style={{ maxWidth: '700px', margin: '0 auto', padding: '15px' }}>
      {/* Resumo da Sessão Ativa */}
      {sessao ? (
        <div className="card" style={{ background: 'var(--card-bg, #1E1E1E)', border: '1px solid var(--border, #2C2C2C)', borderRadius: '15px', padding: '20px' }}>
          <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--blue-light, #5AB3D4)', textTransform: 'uppercase' }}>Contexto da Obra</span>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>
              {new Date().toLocaleDateString('pt-PT')}
            </span>
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>{sessao.nomeObra || 'Obra sem nome'}</h2>
          <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '4px' }}>
            <strong style={{ color: '#fff' }}>Setor:</strong> {sessao.setorPavimento || 'Não especificado'}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
            <strong style={{ color: '#fff' }}>Equipa ({sessao.colaboradores?.length || 0}):</strong>{' '}
            {sessao.colaboradores?.length > 0
              ? sessao.colaboradores.join(', ')
              : 'Nenhum colaborador registrado'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'rgba(235, 149, 50, 0.1)', borderLeft: '4px solid var(--orange, #EB9532)', color: '#EB9532', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
          <p style={{ fontWeight: '500' }}>
            Nenhuma obra foi selecionada para o turno atual.
          </p>
        </div>
      )}

      {/* Formulário de Diário */}
      <form onSubmit={handleSubmit} className="card space-y-4" style={{ background: 'var(--card-bg, #1E1E1E)', border: '1px solid var(--border, #2C2C2C)', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Relato Principal */}
        <div className="campo-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: '600', textTransform: 'uppercase' }}>Relato das Atividades: *</label>
          <textarea
            rows={4}
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            required
            placeholder="Digite ou utilize a gravação por voz..."
            className="textarea"
            style={{ 
              width: '100%', 
              background: '#333', 
              border: '1px solid #444', 
              borderRadius: '8px', 
              padding: '12px', 
              color: '#fff', 
              fontSize: '15px', 
              resize: 'none', 
              outline: 'none' 
            }}
          />
        </div>

        {/* Ocorrências */}
        <div className="campo-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: '600', textTransform: 'uppercase' }}>Ocorrências / Imprevistos:</label>
          <textarea
            rows={2}
            value={ocorrencias}
            onChange={(e) => setOcorrencias(e.target.value)}
            placeholder="Atrasos em materiais, quebra de máquinas, chuva..."
            style={{ 
              width: '100%', 
              background: '#333', 
              border: '1px solid #444', 
              borderRadius: '8px', 
              padding: '12px', 
              color: '#fff', 
              fontSize: '15px', 
              resize: 'none', 
              outline: 'none' 
            }}
          />
        </div>

        {/* Observações e Recomendações */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div className="campo-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: '600', textTransform: 'uppercase' }}>Observações:</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas gerais do dia..."
              style={{ 
                width: '100%', 
                background: '#333', 
                border: '1px solid #444', 
                borderRadius: '8px', 
                padding: '12px', 
                color: '#fff', 
                fontSize: '15px', 
                resize: 'none', 
                outline: 'none' 
              }}
            />
          </div>
          <div className="campo-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: '600', textTransform: 'uppercase' }}>Recomendações:</label>
            <textarea
              rows={2}
              value={recomendacoes}
              onChange={(e) => setRecomendacoes(e.target.value)}
              placeholder="Instruções para o próximo turno..."
              style={{ 
                width: '100%', 
                background: '#333', 
                border: '1px solid #444', 
                borderRadius: '8px', 
                padding: '12px', 
                color: '#fff', 
                fontSize: '15px', 
                resize: 'none', 
                outline: 'none' 
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-login"
          style={{ 
            width: '100%', 
            background: 'linear-gradient(135deg, var(--blue-primary, #2AA1C0) 0%, #17708C 100%)', 
            color: '#white', 
            padding: '14px', 
            borderRadius: '12px', 
            border: 'none', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Guardar Diário (Offline)
        </button>
      </form>
    </div>
  );
}
