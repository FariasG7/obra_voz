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
    <div className="content space-y-4 diario-content-wrapper">
      {/* Resumo da Sessão Ativa */}
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

      {/* Formulário de Diário */}
      <form onSubmit={handleSubmit} className="card space-y-4 diario-form-card">
        
        {/* Relato Principal */}
        <div className="campo-group">
          <label>Relato das Atividades: *</label>
          <textarea
            rows={4}
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            required
            placeholder="Digite ou utilize a gravação por voz..."
            className="textarea diario-textarea"
          />
        </div>

        {/* Ocorrências */}
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

        {/* Observações e Recomendações */}
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
          Guardar Diário (Offline)
        </button>
      </form>
    </div>
  );
}

export default FormDiario;
