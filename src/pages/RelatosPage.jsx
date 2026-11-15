// src/pages/RelatosPage.jsx
import React, { useState } from 'react';
// Importe a sua instância do Dexie.js se estiver a usá-la:
// import { db } from '../db';

export default function RelatosPage({ sessao, onSessaoVoltar, onSessaoFinalizada }) {
  const [descricao, setDescricao] = useState('');
  const [horasTrabalhadas, setHorasTrabalhadas] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSalvarRelato = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const novoRelato = {
        obraId: sessao.obraId,
        obraNome: sessao.obraNome,
        setorPavimento: sessao.setorPavimento,
        colaboradores: sessao.colaboradores,
        descricao,
        horasTrabalhadas: Number(horasTrabalhadas) || 0,
        dataRegisto: new Date().toISOString()
      };

      // 1. Salva na base de dados local (ex: Dexie.js / IndexedDB)
      // await db.relatos.add(novoRelato);
      console.log('Relato guardado com sucesso:', novoRelato);

      // 2. SUCESSO: Remove a chave do localStorage para limpar o rascunho do turno
      localStorage.removeItem('obravoz_sessao_ativa');

      // 3. Notifica o App.jsx para reiniciar o fluxo
      onSessaoFinalizada();
    } catch (error) {
      console.error('Erro ao guardar o relato:', error);
      alert('Ocorreu um erro ao guardar o relato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content diario-content-wrapper">
      <div className="card diario-form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 className="diario-sessao-titulo" style={{ margin: 0 }}>Registar Turno</h2>
          <button 
            type="button" 
            onClick={onSessaoVoltar}
            style={{ background: 'transparent', border: 'none', color: '#2AA1C0', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ← Alterar Dados da Obra
          </button>
        </div>

        <div className="resumo-sessao-card" style={{ background: '#1E1E1E', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
          <p style={{ margin: '4px 0' }}><strong>Obra:</strong> {sessao.obraNome}</p>
          <p style={{ margin: '4px 0' }}><strong>Setor:</strong> {sessao.setorPavimento || 'Não especificado'}</p>
          <p style={{ margin: '4px 0' }}><strong>Colaboradores:</strong> {sessao.colaboradores?.length > 0 ? sessao.colaboradores.join(', ') : 'Nenhum registado'}</p>
        </div>

        <form onSubmit={handleSalvarRelato}>
          <div className="campo-group">
            <label>Descrição do Turno / Atividades Executadas *</label>
            <textarea 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o andamento dos trabalhos, betonagem, cofragem..."
              rows="5"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#121212', color: '#fff', border: '1px solid #333' }}
            />
          </div>

          <div className="campo-group">
            <label>Horas de Trabalho Estimadas</label>
            <input 
              type="number"
              value={horasTrabalhadas}
              onChange={(e) => setHorasTrabalhadas(e.target.value)}
              placeholder="Ex: 8"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#121212', color: '#fff', border: '1px solid #333' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-guardar-diario" 
            disabled={loading}
            style={{ width: '100%', marginTop: '15px', padding: '12px', cursor: 'pointer' }}
          >
            {loading ? 'A guardar relato...' : 'Guardar Relato Final'}
          </button>
        </form>
      </div>
    </div>
  );
}
