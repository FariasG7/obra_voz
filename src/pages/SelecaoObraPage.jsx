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

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
      width: '100%',
      maxWidth: '440px',
      backgroundColor: '#1e293b',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      border: '1px solid #334155',
    },
    header: {
      textAlign: 'center',
      borderBottom: '1px solid #334155',
      paddingBottom: '16px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#60a5fa',
      margin: '0',
    },
    subtitle: {
      fontSize: '14px',
      color: '#94a3b8',
      marginTop: '4px',
    },
    group: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#e2e8f0',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      borderRadius: '10px',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      border: '1px solid #475569',
      outline: 'none',
      boxSizing: 'border-box',
    },
    row: {
      display: 'flex',
      gap: '8px',
    },
    addButton: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '10px',
      padding: '0 20px',
      fontWeight: 'bold',
      fontSize: '18px',
      cursor: 'pointer',
    },
    chipsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '12px',
      maxHeight: '120px',
      overflowY: 'auto',
      padding: '8px',
      backgroundColor: '#0f172a',
      borderRadius: '10px',
      border: '1px solid #334155',
    },
    chip: {
      backgroundColor: '#334155',
      color: '#f1f5f9',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid #475569',
    },
    removeBtn: {
      background: 'none',
      border: 'none',
      color: '#f87171',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '14px',
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '16px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      marginTop: '8px',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.header}>
          <h1 style={styles.title}>ObraVoz</h1>
          <p style={styles.subtitle}>Configurar Turno de Trabalho</p>
        </div>

        <form onSubmit={handleConfirmarContexto}>
          
          <div style={styles.group}>
            <label style={styles.label}>
              1. Qual é a Obra de Hoje? <span style={{ color: '#60a5fa' }}>*</span>
            </label>
            <select
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              required
              style={styles.input}
            >
              <option value="" style={{ backgroundColor: '#0f172a' }}>-- Selecione uma obra --</option>
              {obras?.map((obra) => (
                <option key={obra.id} value={obra.id} style={{ backgroundColor: '#0f172a' }}>
                  {obra.nome_obra}
                </option>
              ))}
              <option value="outro" style={{ backgroundColor: '#0f172a' }}>Outro (Digitar nome...)</option>
            </select>
          </div>

          {obraId === 'outro' && (
            <div style={styles.group}>
              <label style={styles.label}>Nome da Nova Obra *</label>
              <input
                type="text"
                placeholder="Digite o nome da obra"
                value={novaObraNome}
                onChange={(e) => setNovaObraNome(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.group}>
            <label style={styles.label}>2. Setor ou Pavimento</label>
            <input
              type="text"
              placeholder="Ex: Bloco A - Laje do 2º Piso"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>3. Colaboradores Presentes</label>
            <div style={styles.row}>
              <input
                type="text"
                placeholder="Nome do colaborador"
                value={colaboradorInput}
                onChange={(e) => setColaboradorInput(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddColaborador}
                style={styles.addButton}
              >
                +
              </button>
            </div>

            {colaboradores.length > 0 && (
              <div style={styles.chipsContainer}>
                {colaboradores.map((colaborador, index) => (
                  <span key={index} style={styles.chip}>
                    {colaborador}
                    <button
                      type="button"
                      onClick={() => handleRemoveColaborador(index)}
                      style={styles.removeBtn}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" style={styles.submitButton}>
            Iniciar Registo de Obra
          </button>
        </form>

      </div>
    </div>
  );
}
