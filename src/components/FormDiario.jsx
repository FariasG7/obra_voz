import React, { useState } from 'react';
import { useObraVozDB } from '../hooks/useObraVozDB';

export function FormDiario() {
  const { obras, salvarDiarioOffline } = useObraVozDB();

  const [obraId, setObraId] = useState('');
  const [setor, setSetor] = useState('');
  const [colaboradoresInput, setColaboradoresInput] = useState('');
  const [relato, setRelato] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const arrayColaboradores = colaboradoresInput
      .split(',')
      .map((nome) => nome.trim())
      .filter(Boolean);

    await salvarDiarioOffline({
      obra_id: obraId,
      setor_pavimento: setor,
      colaboradores_nomes: arrayColaboradores,
      relato_atividades: relato,
      ocorrencias: ocorrencias,
      observacoes: observacoes,
      recomendacoes: recomendacoes,
    });

    alert('Diário salvo com sucesso no dispositivo (Offline)!');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* 1. Campo de Seleção da Obra */}
      <div>
        <label className="block text-sm font-bold mb-1">Selecione a Obra:</label>
        <select
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">-- Selecione uma obra --</option>
          {obras?.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nome_obra}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Campo Setor / Pavimento */}
      <div>
        <label className="block text-sm font-bold mb-1">Setor / Pavimento:</label>
        <input
          type="text"
          placeholder="Ex: Bloco A - Laje do 2º Piso"
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* 3. Colaboradores */}
      <div>
        <label className="block text-sm font-bold mb-1">Colaboradores (separados por vírgula):</label>
        <input
          type="text"
          placeholder="Ex: João Silva, Carlos Santos, Eudes"
          value={colaboradoresInput}
          onChange={(e) => setColaboradoresInput(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* 4. Relato Principal */}
      <div>
        <label className="block text-sm font-bold mb-1">Relato das Atividades:</label>
        <textarea
          rows={4}
          value={relato}
          onChange={(e) => setRelato(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* 5. Ocorrências */}
      <div>
        <label className="block text-sm font-bold mb-1">Ocorrências / Imprevistos:</label>
        <textarea
          rows={2}
          value={ocorrencias}
          onChange={(e) => setOcorrencias(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* 6. Observações e Recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Observações:</label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Recomendações:</label>
          <textarea
            rows={2}
            value={recomendacoes}
            onChange={(e) => setRecomendacoes(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">
        Guardar Diário (Offline)
      </button>
    </form>
  );
}
