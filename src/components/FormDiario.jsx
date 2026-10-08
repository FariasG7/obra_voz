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
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Resumo da Sessão Ativa */}
      {sessao ? (
        <div className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-semibold text-blue-400">Contexto da Obra</span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('pt-PT')}
            </span>
          </div>
          <h2 className="text-lg font-bold">{sessao.nomeObra || 'Obra sem nome'}</h2>
          <p className="text-sm text-slate-300">
            <strong>Setor:</strong> {sessao.setorPavimento || 'Não especificado'}
          </p>
          <p className="text-sm text-slate-300">
            <strong>Equipa ({sessao.colaboradores?.length || 0}):</strong>{' '}
            {sessao.colaboradores?.length > 0
              ? sessao.colaboradores.join(', ')
              : 'Nenhum colaborador registrado'}
          </p>
        </div>
      ) : (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded">
          <p className="text-sm font-medium">
            Nenhuma obra foi selecionada para o turno atual.
          </p>
        </div>
      )}

      {/* Formulário de Diário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Relato Principal */}
        <div>
          <label className="block text-sm font-bold mb-1">Relato das Atividades: *</label>
          <textarea
            rows={4}
            value={relato}
            onChange={(e) => setRelato(e.target.value)}
            required
            placeholder="Digite ou utilize a gravação por voz..."
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Ocorrências */}
        <div>
          <label className="block text-sm font-bold mb-1">Ocorrências / Imprevistos:</label>
          <textarea
            rows={2}
            value={ocorrencias}
            onChange={(e) => setOcorrencias(e.target.value)}
            placeholder="Atrasos em materiais, quebra de máquinas, chuva..."
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Observações e Recomendações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Observações:</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas gerais do dia..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Recomendações:</label>
            <textarea
              rows={2}
              value={recomendacoes}
              onChange={(e) => setRecomendacoes(e.target.value)}
              placeholder="Instruções para o próximo turno..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow transition-colors"
        >
          Guardar Diário (Offline)
        </button>
      </form>
    </div>
  );
}
