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

  // --- GERADOR DE PDF ---
 /** const gerarPDF = () => {
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
        
        const dadosCofragem = linhasCofragem.map(l => [
          l.nome || '-', 
          l.quantidade || '1', 
          l.largura || '0', 
          l.altura || '0', 
          l.comprimento || '0'
        ]);
        
        autoTable(doc, {
          startY: yAtual + 4,
          head: [['Elemento', 'Qtd', 'Largura (m)', 'Altura (m)', 'Comprimento (m)']],
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

        const dadosBetao = linhasBetao.map(l => [
          l.nome || '-', 
          l.quantidade || '1', 
          l.largura || '0', 
          l.altura || '0', 
          l.comprimento || '0'
        ]);

        autoTable(doc, {
          startY: yAtual + 4,
          head: [['Elemento', 'Qtd', 'Largura (m)', 'Altura (m)', 'Comprimento (m)']],
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
      doc.save(`Relatorio_ObraVoz_${dataHoje}.pdf`);

      setStatus("✅ PDF Guardado!");
    } catch (err) {
      console.error("Erro no PDF:", err);
      setStatus("❌ Erro no PDF");
    }
  };
  **/

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
        
        const dadosCofragem = linhasCofragem.map(l => [
          l.nome || '-', 
          l.quantidade || '1', 
          l.largura || '0', 
          l.altura || '0', 
          l.comprimento || '0'
        ]);
        
        autoTable(doc, {
          startY: yAtual + 4,
          head: [['Elemento', 'Qtd', 'Largura (m)', 'Altura (m)', 'Comprimento (m)']],
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

        const dadosBetao = linhasBetao.map(l => [
          l.nome || '-', 
          l.quantidade || '1', 
          l.largura || '0', 
          l.altura || '0', 
          l.comprimento || '0'
        ]);

        autoTable(doc, {
          startY: yAtual + 4,
          head: [['Elemento', 'Qtd', 'Largura (m)', 'Altura (m)', 'Comprimento (m)']],
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

      // 1. ABRIR EM NOVA ABA (Blob URL) & SALVAR DIRECTO
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');

      // Também dispara o download diretamente
      doc.save(nomeArquivo);

      // 2. LIMPAR FORMULÁRIO E LOCALSTORAGE APÓS GERAR
      limparFormulario();

      setStatus("✅ PDF Gerado e Dados Limpos!");
    } catch (err) {
      console.error("Erro no PDF:", err);
      setStatus("❌ Erro no PDF");
    }
  };

  // --- LIMPEZA DOS CAMPOS ---
  const limparFormulario = () => {
    // Reseta os estados do React
    setTexto('');
    setFotos([]);
    const medicaoInicial = [
      { id: Date.now(), tipo: tipoMedicao, nome: 'Pilar', quantidade: 1, largura: '', altura: '', comprimento: '' }
    ];
    setMedicoes(medicaoInicial);

    // Reseta o localStorage
    localStorage.removeItem('diario_texto');
    localStorage.setItem('diario_medicoes', JSON.stringify(medicaoInicial));
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
             <button onClick={adicionarLinhaMedicao} className="btn-add">
              +
              </button>
            <select 
              value={tipoMedicao} 
              onChange={(e) => setTipoMedicao(e.target.value)}
              className="select-tipo-medicao"
            >
              <option value="cofragem">📐 Cofragem (m²)</option>
              <option value="betao">🧱 Betão (m³)</option>
            </select>
          </div>

          {medicoes.map((item) => (
            <div key={item.id} className="row-inputs">
              <select
                className="select-elemento"
                value={item.nome}
                onChange={(e) => atualizarMedicao(item.id, 'nome', e.target.value)}
              >
                <option value="Pilar">Pilar</option>
                <option value="Parede">Parede</option>
                <option value="Escada">Escada</option>
                <option value="Sapata">Sapata</option>
                <option value="Laje">Laje</option>
                <option value="Caixa de Elevador">Caixa de Elevador</option>
                <option value="Outro">Outro</option>
              </select>

              <input 
                type="number" 
                placeholder="Qtd" 
                title="Quantidade"
                value={item.quantidade}
                min="1"
                onChange={(e) => atualizarMedicao(item.id, 'quantidade', e.target.value)}
              />

              <input 
                type="number" 
                placeholder="L" 
                title="Largura"
                value={item.largura}
                onChange={(e) => atualizarMedicao(item.id, 'largura', e.target.value)}
              />
              <input 
                type="number" 
                placeholder="A" 
                title="Altura"
                value={item.altura}
                onChange={(e) => atualizarMedicao(item.id, 'altura', e.target.value)}
              />
              <input 
                type="number" 
                placeholder="C" 
                title="Comprimento"
                value={item.comprimento}
                onChange={(e) => atualizarMedicao(item.id, 'comprimento', e.target.value)}
              />

              <button 
                type="button" 
                className="btn-delete"
                onClick={() => removerLinhaMedicao(item.id)}
                title="Apagar Linha"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}

        </div>

        {/* BOTÕES FINAIS */}
        <div style={{ marginTop: '20px' }}>
          <button className="btn-finalizar" onClick={gerarPDF}>
            <FaRegFilePdf style={{ marginRight: '8px' }} /> Gerar Relatório PDF
          </button>

          <button onClick={logout} className="btn-sair">
            <FaSignOutAlt style={{ marginRight: '5px' }} /> Sair da Conta
          </button>
        </div>
      </main>
    </div>
  );
}

export default MainContent;
