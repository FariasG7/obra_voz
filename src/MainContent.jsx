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

  const
