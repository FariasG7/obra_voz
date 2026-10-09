// src/pages/SelecaoObraPage.jsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function SelecaoObraPage({ onSessaoIniciada }) {
  const obras = useLiveQuery(() => db.obras.toArray(), []);

  const [obraId, setObraId] = useState('');
  const [novaObraNome, setNovaObraNome] = useState('');
  const [setor, setSetor] = useState('');
  const [colaboradorInput, setColaboradorInput] = useState('');
  const [colaboradores, setColaboradores] = useState([]);

  const handleAddColaborador = (e) => {
    e.preventDefault();
    if (colaboradorInput.trim()) {
      setColaboradores([...colaboradores, colaboradorInput.trim()]);
      setColaboradorInput('');
    }
  };

  const handleRemoveColaborador = (index) => {
    setColaboradores(colaboradores.filter((_, i) => i !== index));
  };

  const handleConfirmarContexto = (e) => {
    e.preventDefault();

    if (!obraId) {
      alert('Por favor, selecione uma obra para prosseguir.');
      return;
    }

    let nomeObraFinal = '';
    let enderecoFinal = '';

    if (obraId === 'outro') {
      if (!novaObraNome.trim()) {
        alert('Por favor, digite o nome da nova obra.');
        return;
      }
      nomeObraFinal = novaObraNome.trim();
    } else {
      const obraSelecionada = obras?.find((o) => o.id === Number(obraId) || o.id === obraId);
      nomeObraFinal = obraSelecionada?.nome_obra || '';
      enderecoFinal = obraSelecionada?.endereco_completo || '';
    }

    const sessaoObra = {
      obraId: obraId === 'outro' ? 'custom_' + Date.now() : obraId,
      nomeObra: nomeObraFinal,
      enderecoObra: enderecoFinal,
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
    <div className="login-container">
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        
        <div className="header" style={{ position: 'relative', background: 'transparent', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>Configurar Turno de Trabalho</p>
        </div>

        <form onSubmit={handleConfirmarContexto} className="login-form">
          
          <div className="campo-group">
            <label>1. Qual é a Obra de Hoje? *</label>
            <select
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              required
              className="obra-select"
            >
              <option value="">-- Selecione uma obra --</option>
              {obras?.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome_obra}
                </option>
              ))}
              <option value="outro">Outro (Digitar nome...)</option>
            </select>
          </div>

          {obraId === 'outro' && (
            <div className="campo-group">
              <label>Nome da Nova Obra *</label>
              <input
                type="text"
                placeholder="Digite o nome da obra"
                value={novaObraNome}
                onChange={(e) => setNovaObraNome(e.target.value)}
                required
                className="login-input"
              />
            </div>
          )}

          <div className="campo-group">
            <label>2. Setor ou Pavimento</label>
            <input
              type="text"
              placeholder="Ex: Bloco A - Laje do 2º Piso"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="campo-group">
            <label>3. Colaboradores Presentes</label>
            <div className="obra-row-add">
              <input
                type="text"
                placeholder="Nome do colaborador"
                value={colaboradorInput}
                onChange={(e) => setColaboradorInput(e.target.value)}
                className="login-input"
              />
              <button
                type="button"
                onClick={handleAddColaborador}
                className="btn-add-colaborador"
              >
                +
              </button>
            </div>

            {colaboradores.length > 0 && (
              <div className="colaboradores-chips-container">
                {colaboradores.map((colaborador, index) => (
                  <span key={index} className="colaborador-chip">
                    {colaborador}
                    <button
                      type="button"
                      onClick={() => handleRemoveColaborador(index)}
                      className="btn-remover-chip"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-login" style={{ marginTop: '10px' }}>
            Iniciar Registo de Obra
          </button>
        </form>

      </div>
    </div>
  );
}
