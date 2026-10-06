import React, { useState, useEffect, useRef, useCallback } from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import './App.css';
import { 
  FaMicrophone, 
  FaCamera, 
  FaPaperclip, 
  FaRegFilePdf, 
  FaTrash,
  FaPlus,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

function MainContent() {
  const { logout } = useAuth();
  
  // --- ESTADOS ---
  const [texto, setTexto] = useState(() => localStorage.getItem('diario_texto') || '');
  const [fotos, setFotos] = useState([]);
  
  // Seletor de Tipo (Cofragem ou Betão)
  const [tipoMedicao, setTipoMedicao] = useState('cofragem'); 

  // Lista única de medições
  const [medicoes, setMedicoes] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('diario_medicoes')) || [
        { id: 1, tipo: 'cofragem', nome: 'Pilar', quantidade: 1, largura: '', altura: '', comprimento: '' }
      ]; 
    } catch { 
      return [{ id: Date.now(), tipo: 'cofragem', nome: 'Pilar', quantidade: 1, largura: '', altura: '', comprimento: '' }]; 
    }
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
        setClima(`${Math.round(data.main.temp)}°C | ${data.weather[0].description}`);
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

  // --- MANIPULAÇÃO DE MEDIÇÕES ---
  const adicionarLinhaMedicao = () => {
    setMedicoes(prev => [
      ...prev,
      { id: Date.now(), tipo: tipoMedicao, nome: 'Pilar', quantidade: 1, largura: '', altura: '', comprimento: '' }
    ]);
  };

  const atualizarMedicao = (id, campo, valor) => {
    setMedicoes(prev =>
      prev.map(item => item.id === id ? { ...item, [campo]: valor } : item)
    );
  };

  const removerLinhaMedicao = (id) => {
    setMedicoes(prev => prev.filter(item => item.id !== id));
  };

  const limparFormulario = () => {
    setTexto('');
    setFotos([]);
    const medicaoInicial = [
      { id: Date.now(), tipo: tipoMedicao, nome: 'Pilar', quantidade: 1, largura: '', altura: '', comprimento: '' }
    ];
    setMedicoes(medicaoInicial);

    localStorage.removeItem('diario_texto');
    localStorage.setItem('diario_medicoes', JSON.stringify(medicaoInicial));
  };

  // --- CÁLCULO DE TOTAL PARA O PDF ---
  const calcularTotalItem = (tipo, qtd, larg, alt, comp) => {
    const q = parseFloat(qtd) || 1;
    const l = parseFloat(larg) || 0;
    const a = parseFloat(alt) || 0;
    const c = parseFloat(comp) || 0;

    if (tipo === 'cofragem') {
      // Se houver Largura, Altura e Comprimento -> Perímetro * Altura * Qtd
      // Se apenas L e A -> L * A * Qtd
      let areaUnitaria = 0;
      if (l > 0 && a > 0 && c > 0) {
        areaUnitaria = 2 * (l + c) * a;
      } else if (l > 0 && a > 0) {
        areaUnitaria = l * a;
      } else if (c > 0 && a > 0) {
        areaUnitaria = c * a;
      } else if (l > 0 && c > 0) {
        areaUnitaria = l * c;
      }
      return (q * areaUnitaria).toFixed(2);
    } else {
      // Betão: Volume = L * A * C * Qtd (ou as dimensões informadas)
      const factorL = l > 0 ? l : 1;
      const factorA = a > 0 ? a : 1;
      const factorC = c > 0 ? c : 1;
      
      if (l === 0 && a === 0 && c === 0) return "0.00";
      return (q * factorL * factorA * factorC).toFixed(2);
    }
  };

  // --- GERADOR DE PDF ---
  const gerarPDF = () => {
    try {
      setStatus("⏳ Gerando PDF...");
      const doc = new jsPDF();
      const largura = doc.internal.pageSize.getWidth();
      const alturaPagina = doc.internal.pageSize.getHeight();
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.text("RELATÓRIO DIÁRIO DE OBRA", 15, 20);
      
      doc.setFontSize(9);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, largura - 15, 16, { align: 'right' });
      
      const climaLimpo = clima ? clima.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, '').trim() : "Não informado";
      doc.text(`Clima: ${climaLimpo}`, largura - 15, 22, { align: 'right' });
      
      doc.line(15, 26, largura - 15, 26);

      // Relato
      doc.setFontSize(11);
      doc.setTextColor(0, 102, 204);
      doc.text("RELATO:", 15, 35);
      doc.setTextColor(0);
      
      const relatoTexto = texto && texto.trim() !== "" ? texto : "Sem relato informado.";
      const textSplit = doc.splitTextToSize(relatoTexto, largura - 30);
      doc.text(textSplit, 15, 42);

      let yAtual = 42 + (textSplit.length * 6) + 10;

      // Tabelas de Medição
      const linhasCofragem = medicoes.filter(m => m.tipo === 'cofragem' && (m.nome || m.comprimento || m.largura || m.altura));
      const linhasBetao = medicoes.filter(m => m.tipo === 'betao' && (m.nome || m.comprimento || m.largura || m.altura));

      if (linhasCofragem.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 102, 204);
        doc.text("COFRAGEM (m²)", 15, yAtual);
        
        let somaTotalCofragem = 0;
        const dadosCofragem = linhasCofragem.map(l => {
          const tot = calcularTotalItem('cofragem', l.quantidade, l.largura, l.altura, l.comprimento);
          somaTotalCofragem += parseFloat(tot);
          return [
            l.nome || '-', 
            l.quantidade || '1', 
            l.largura || '0', 
            l.altura || '0', 
            l.comprimento || '0',
            `${tot} m²`
          ];
        });

        // Adiciona linha final com o Total Geral de Cofragem
        dadosCofragem.push([
          { content: 'TOTAL GERAL DE COFRAGEM', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `${somaTotalCofragem.toFixed(2)} m²`, styles: { fontStyle: 'bold', fillColor: [230, 240, 255] } }
        ]);
        
        autoTable(doc, {
          startY: yAtual + 4,
          head: [['Elemento', 'Qtd', 'Largura (m)', 'Altura (m)', 'Comprimento (m)', 'Total (m²)']],
          body: dadosCofragem,
          styles: { halign: 'center', fontSize: 9 },
          headStyles: { fillColor: [0, 102, 204] },
          theme: 'grid'
        });
        yAtual = doc.lastAutoTable.finalY + 10;
      }

      if (linhasBetao.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(40, 167, 69);
        doc.text("BETÃO (m³)", 15, yAtual);

        let somaTotalBetao = 0;
        const dadosBetao = linhasBetao.map(l => {
          const tot = calcularTotalItem('betao', l.quantidade, l.largura, l.altura, l.comprimento);
          somaTotalBetao += parseFloat(tot);
          return [
            l.nome || '-', 
            l.quantidade || '1', 
            l.largura || '0', 
            l.altura || '0', 
            l.comprimento || '0',
            `${tot} m³`
          ];
        });

        // Adiciona linha final com o Total Geral de Betão
        dadosBetao.push([
          { content: 'TOTAL GERAL DE BETÃO', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: `${somaTotalBetao.toFixed(2)} m³`, styles: { fontStyle: 'bold', fillColor: [230, 245, 230] } }
        ]);

        autoTable(doc, {
          startY: yAtual + 4,
          head: [['Elemento', 'Qtd', 'Largura (m)', 'Altura (m)', 'Comprimento (m)', 'Total (m³)']],
          body: dadosBetao,
          styles: { halign: 'center', fontSize: 9 },
          headStyles: { fillColor: [40, 167, 69] },
          theme: 'grid'
        });
        yAtual = doc.lastAutoTable.finalY + 10;
      }

      // Fotos
      if (fotos.length > 0) {
        if (yAtual > alturaPagina - 60) {
          doc.addPage();
          yAtual = 20;
        }
        doc.setFontSize(11);
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

      const dataHoje = new Date().toISOString().slice(0, 10);
      const nomeArquivo = `Relatorio_ObraVoz_${dataHoje}.pdf`;

      // Baixa automaticamente o arquivo sem sair do aplicativo
      doc.save(nomeArquivo);

      // Limpa os dados da interface para o novo uso
      limparFormulario();

      setStatus("✅ PDF Baixado e Dados Limpos!");
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
        {/* CARD DO RELATO E FOTOS */}
        <div className="card">
          <textarea 
            value={texto} 
            onChange={(e) => setTexto(e.target.value)} 
            placeholder="Relate o trabalho de hoje..." 
            className="textarea" 
          />

          <div className="acoes">
            <button 
              onClick={alternarGravacao} 
              className={`icon-btn btn-mic ${gravando ? 'recording' : ''}`}
              title="Gravar por voz"
            >
              <FaMicrophone />
            </button>

            <label className="icon-btn btn-cam" title="Tirar foto">
              <FaCamera />
              <input type="file" accept="image/*" capture="environment" onChange={handleFoto} hidden />
            </label>

            <label className="icon-btn btn-clip" title="Anexar foto">
              <FaPaperclip />
              <input type="file" accept="image/*" multiple onChange={handleFoto} hidden />
            </label>
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

        {/* CARD DAS MEDIÇÕES */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="seletor-medicao-header">
            <h3>Medições:</h3>
            <div className="header-medicao-acoes">
              <select 
                value={tipoMedicao} 
                onChange={(e) => setTipoMedicao(e.target.value)}
                
