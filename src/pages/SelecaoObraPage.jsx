// src/pages/SelecaoObraPage.jsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import './page/SelecaoObraPage.css';

export function SelecaoObraPage({ onSessaoIniciada }) {
  // Carrega as obras cadastradas localmente
  const obras = useLiveQuery(() => db.obras.toArray(), []);

  // Estados do formulário de contexto do dia
  const [obraId, setObraId] = useState('');
  const [setor, setSetor] = useState('');
  const [colaboradorInput, setColaboradorInput] = useState('');
  const [colaboradores, setColaboradores] = useState([]);

  // Adiciona um colaborador à lista visual
  const handleAddColaborador = (e) => {
    e.preventDefault();
    if (colaboradorInput.trim()) {
      setColaboradores([...colaboradores, colaboradorInput.trim()]);
      setColaboradorInput('');
    }
  };

  // Remove um colaborador da lista
  const handleRemoveColaborador = (index) => {
    setColaboradores(colaboradores.filter((_, i) => i !== index));
  };

  // Grava o contexto da sessão e avança para a tela principal
  const handleConfirmarContexto = (e) => {
    e.preventDefault();

    if (!obraId) {
      alert('Por favor, selecione uma obra para prosseguir.');
      return;
    }

    const obraSelecionada = obras?.find((o) => o.id === Number(obraId) || o.id === obraId);

    // Guarda a sessão ativa no localStorage para uso em todas as telas
    const sessaoObra = {
      obraId,
      nomeObra: obraSelecionada?.nome_obra || '',
      enderecoObra: obraSelecionada?.endereco_completo || '',
      setorPavimento: setor,
      colaboradores,
      dataInicioSessao: new Date().toISOString(),
    };

    localStorage.setItem('obravoz_sessao_ativa', JSON.stringify(sessaoObra));

    if (typeof onSessaoIniciada === 'function') {
      onSessaoIniciada(sessaoObra);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-6">
        
        {/* Cabeçalho */}
        <div className="text-center border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-extrabold text-blue-400 tracking-wide">ObraVoz</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Configurar Turno de Trabalho</p>
        </div>

        <form onSubmit={handleConfirmarContexto} className="space-y-5">
          
          {/* 1. Seleção da Obra */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              1. Qual é a Obra de Hoje? <span className="text-blue-400">*</span>
            </label>
            <select
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              required
              className="w-full p-3.5 rounded-xl bg-slate-900 text-white border border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">-- Selecione uma obra --</option>
              {obras?.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome_obra}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Setor / Pavimento */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              2. Setor ou Pavimento
            </label>
            <input
              type="text"
              placeholder="Ex: Bloco A - Laje do 2º Piso"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-900 text-white border border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* 3. Colaboradores da Equipa */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              3. Colaboradores Presentes
            </label>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nome do colaborador"
                value={colaboradorInput}
                onChange={(e) => setColaboradorInput(e.target.value)}
                className="flex-1 p-3.5 rounded-xl bg-slate-900 text-white border border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={handleAddColaborador}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>

            {/* Chips de Colaboradores Adicionados */}
            {colaboradores.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 max-h-32 overflow-y-auto">
                {colaboradores.map((colaborador, index) => (
                  <span
                    key={index}
                    className="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-slate-600 shadow-sm"
                  >
                    {colaborador}
                    <button
                      type="button"
                      onClick={() => handleRemoveColaborador(index)}
                      className="text-red-400 font-bold hover:text-red-300 ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Confirmação */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 text-base mt-6 cursor-pointer active:scale-[0.99]"
          >
            Iniciar Registo de Obra
          </button>
        </form>

      </div>
    </div>
  );
}
