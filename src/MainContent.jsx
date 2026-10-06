import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import './App.css';
import { 
  FaMicrophone, 
  FaCamera, 
  FaPaperclip, 
  FaRegFilePdf, 
  FaPlus, 
  FaSignOutAlt, 
  FaTrash 
} from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

function MainContent() {
  const { logout } = useAuth();
  
  // --- ESTADOS ---
  const [texto, setTexto] = useState(() => localStorage.getItem('diario_texto') || '');
  const [fotos, setFotos] = useState([]);
  
  // Seletor de Tipo (Cofragem ou Betão)
  const [tipoMedicao, setTipoMedicao] = useState('cofragem'); // 'cofragem' ou 'betao'

  // Lista única de medições
  const [medicoes, setMedicoes] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('diario_medicoes')) || []; 
    } catch { 
      return []; 
    }
  });

  // Campos do formulário atual de medição
  const [novaMedicao, setNovaMedicao] = useState({
    nome: '',
    largura: '',
    altura: '',
    comprimento: ''
  });

  const [status, setStatus] = useState('Aguardando...');
  const [gravando, setGravando] = useState(false);
  const [clima, setClima] = useState('Buscando localização...');

  const recognitionRef = useRef(null);
  const wakeLockRef = useRef(null);

  // --- PERSISTÊNCIA ---
  useEffect(() => {
    localStorage.setItem('diario_texto', texto);
    localStorage.setItem('diario_medicoes', JSON.stringify(medicoes));
  }, [texto, medicoes]);

  // --- CLIMA ---
  const buscarClima = useCallback(async () => {
    if (!navigator.geolocation) return setClima("GPS Indisponível");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY || "5d69641538ee4295a9ffc578b22ad484";
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`);
        const data = await res.json();
        setClima(`🌡️ ${Math.round(data.main.temp)}°C | ${data.weather[0].description}`);
      } catch { 
        setClima("Erro ao carregar clima"); 
      }
    });
  }, []);

  // --- RECONHECIMENTO DE VOZ ---
  useEffect(() => {
    buscarClima();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-PT';
      rec.continuous = true;
      rec.interimResults = false;

      rec.onresult = (e) => {
        const result = e.results[e.results.length - 1][0].transcript;
        setTexto(prev => prev + (prev ? ' ' : '') + result);
      };

      rec.onerror = () => {
        setGravando(false);
        setStatus('Erro na captura de áudio');
      };

      rec.onend = () => setGravando(false);
      recognitionRef.current = rec;
    }
  }, [buscarClima]);

  const alternarGravacao = async () => {
    if (!recognitionRef.current) return alert("Voz não suportada neste navegador.");
    if (!gravando) {
      try {
        if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
        recognitionRef.current.start();
        setGravando(true);
        setStatus('🟢 Gravando...');
      } catch { 
        setStatus('Erro ao acessar microfone'); 
      }
    } else {
      recognitionRef.current.stop();
      wakeLockRef.current?.release();
      setGravando(false);
      setStatus('✅ Áudio processado');
    }
  };

  // --- PROCESSAMENTO DE FOTOS ---
  const handleFoto = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setFotos(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removerFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  // --- ADICIONAR E REMOVER MEDIÇÕES ---
  const adicionarMedicao = () => {
    if (!novaMedicao.nome && !novaMedicao.comprimento) return;

    const item = {
      id: Date.now(),
      tipo: tipoMedicao,
      nome: novaMedicao.nome || (tipoMedicao === 'cofragem' ? 'Peça Cofragem' : 'Elemento Betão'),
      largura: novaMedicao.largura || '0',
      altura: novaMedicao.altura || '0',
      comprimento: novaMedicao.comprimento || '0'
    };

    setMedicoes(prev => [...prev, item]);
    setNovaMedicao({ nome: '', largura: '', altura: '', comprimento: '' });
  };

  const removerMedicao = (id) => {
    setMedicoes(prev => prev.filter(m => m.id !== id));
  };

  // --- GERADOR DE PDF ---
  const gerarPDF = () => {
    try {
      setStatus("⏳ Gerando PDF...");
      const doc = new jsPDF();
      const largura = doc.internal.pageSize.getWidth();
      const alturaPagina = doc.internal.pageSize.getHeight();
      
      doc.setFontSize(18);
      doc.text("RELATÓRIO DIÁRIO DE OBRA", 15, 20);
      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, largura - 15, 15, { align: 'right' });
      
      const climaLimpo = clima ? clima.replace(/[^\x00-\x7F]/g, "").trim() : "Não informado";
      doc.text(`Clima: ${climaLimpo}`, largura - 15, 22, { align: 'right' });
      doc.line(15, 28, largura - 15, 28);

      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204);
      doc.text("RELATO:", 15, 38);
      doc.setTextColor(0);
      
      const relatoTexto = texto && texto.trim() !== "" ? texto : "Sem relato informado.";
      const textSplit = doc.splitTextToSize(relatoTexto, largura - 30);
      doc.text(textSplit, 15, 45);

      let yAtual = 45 + (textSplit.length * 7) + 10;

      const linhasCofragem = medicoes.filter(m => m.tipo === 'cofragem');
      const linhasBetao = medicoes.filter(m => m.tipo === 'betao');

      if (linhasCofragem.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text("COFRAGEM (m²)", 15, yAtual);
        
        const dadosCofragem = linhasCofragem.map(l => [l.nome, l.largura, l.altura, l.comprimento]);
        autoTable(doc, {
          startY: yAtual + 5,
          head: [['Peça', 'Largura (m)', 'Altura (m)', 'Comprimento (m)']],
          body: dadosCofragem,
          styles: { halign: 'center' },
          headStyles: { fillColor: [0, 102, 204] },
          theme: 'grid'
        });
        yAtual = doc.lastAutoTable.finalY + 12;
      }

      if (linhasBetao.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(40, 167, 69);
        doc.text("BETÃO (m³)", 15, yAtual);

        const dadosBetao = linhasBetao.map(l => [l.nome, l.largura, l.altura, l.comprimento]);
        autoTable(doc, {
          startY: yAtual + 5,
          head: [['Elemento', 'Largura (m)', 'Altura (m)', 'Comprimento (m)']],
          body: dadosBetao,
          styles: { halign: 'center' },
          headStyles: { fillColor: [40, 167, 69] },
          theme: 'grid'
        });
        yAtual = doc.lastAutoTable.finalY + 12;
      }

      if (fotos.length > 0) {
        if (yAtual > alturaPagina - 60) {
          doc.addPage();
          yAtual = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 204);
        doc.text("REGISTOS FOTOGRÁFICOS:", 15, yAtual);
        yAtual += 8;

        const largFoto = 55;
        const altFoto = 45;
        const espacamento = 7;
        let xAtual = 15;

        fotos.forEach((fotoBase64) => {
          if (yAtual + altFoto > alturaPagina - 20) {
            doc.addPage();
            yAtual = 20;
            xAtual = 15;
          }
          try {
            doc.addImage(fotoBase64, 'JPEG', xAtual, yAtual, largFoto, altFoto);
          } catch (e) {
            console.error("Erro ao renderizar imagem no PDF", e);
          }
          xAtual += largFoto + espacamento;
          if (xAtual + largFoto > largura - 15) {
            xAtual = 15;
            yAtual += altFoto + espacamento;
          }
        });
      }

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_ObraVoz_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus("✅ PDF Pronto!");
    } catch (err) {
      console.error("Erro no PDF:", err);
      setStatus("❌ Erro no PDF");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🏗️ ObraVoz</h1>
        <div className="clima-badge">{clima}</div>
      </header>

      <main className="content">
        <div className="card">
          <textarea 
            value={texto} 
            onChange={(e) => setTexto(e.target.value)} 
            placeholder="Relate o trabalho de hoje..." 
            className="textarea" 
          />

          <div className="acoes-gravacao">
            <button 
              onClick={alternarGravacao} 
              className={`icon-btn btn-mic ${gravando ? 'recording' : ''}`}
              title="Gravar por voz"
            >
              <FaMicrophone /> {gravando ? 'Gravando...' : 'Gravar Voz'}
            </button>

            <label className="icon-btn btn-cam" title="Tirar foto">
              <FaCamera />
              <input type="file" accept="image/*" capture="environment" onChange={handleFoto} hidden />
            </label>

            <label className="icon-btn btn-clip" title="Anexar foto">
              <FaPaperclip />
              <input type="file" accept="image/*" multiple onChange={handleFoto} hidden />
            </label>

            <span className="status-badge">{status}</span>
          </div>

          {fotos.length > 0 && (
            <div className="galeria-preview">
              {fotos.map((f, i) => (
                <div key={i} className="foto-item">
                  <img src={f} alt="foto da obra" />
                  <button className="btn-remover-foto" onClick={() => removerFoto(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="seletor-medicao-header">
            <h3>Medições da Obra:</h3>
            <select 
              value={tipoMedicao} 
              onChange={(e) => setTipoMedicao(e.target.value)}
              className="select-tipo-medicao"
            >
              <option value="cofragem">📐 Cofragem (m²)</option>
              <option value="betao">🧱 Betão (m³)</option>
            </select>
          </div>

          <div className="linha-input-medicao">
            <input 
              className="input-peca" 
              placeholder={tipoMedicao === 'cofragem' ? "Peça (Ex: P1, Pilar)" : "Elemento (Ex: Laje 1)"} 
              value={novaMedicao.nome} 
              onChange={e => setNovaMedicao({...novaMedicao, nome: e.target.value})}
            />
            
            <div className="inputs-medidas">
              <div className="campo-container">
                <label>L</label>
                <input 
                  type="number" 
                  placeholder="m" 
                  value={novaMedicao.largura} 
                  onChange={e => setNovaMedicao({...novaMedicao, largura: e.target.value})} 
                />
              </div>
              <div className="campo-container">
                <label>A</label>
                <input 
                  type="number" 
                  placeholder="m" 
                  value={novaMedicao.altura} 
                  onChange={e => setNovaMedicao({...novaMedicao, altura: e.target.value})} 
                />
              </div>
              <div className="campo-container">
                <label>C</label>
                <input 
                  type="number" 
                  placeholder="m" 
                  value={novaMedicao.comprimento} 
                  onChange={e => setNovaMedicao({...novaMedicao, comprimento: e.target.value})} 
                />
              </div>
              
              <button onClick={adicionarMedicao} className="btn-add" title="Adicionar Medição">
                <FaPlus />
              </button>
            </div>
          </div>

          {medicoes.length > 0 && (
            <div className="lista-medicoes-registadas">
              <h4>Registos Adicionados ({medicoes.length}):</h4>
              {medicoes.map((m) => (
                <div key={m.id} className={`item-medicao-linha ${m.tipo}`}>
                  <span className="badge-tipo">
                    {m.tipo === 'cofragem' ? '📐 Cofragem' : '🧱 Betão'}
                  </span>
                  <span className="info-medicao">
                    <strong>{m.nome}</strong> — L: {m.largura}m | A: {m.altura}m | C: {m.comprimento}m
                  </span>
                  <button className="btn-remover-linha" onClick={() => removerMedicao(m.id)}>
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="acoes-finais">
          <button className="btn-finalizar" onClick={gerarPDF}>
            <FaRegFilePdf /> Gerar Relatório PDF
          </button>

          <button onClick={logout} className="btn-sair">
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </main>
    </div>
  );
}

export default MainContent;
