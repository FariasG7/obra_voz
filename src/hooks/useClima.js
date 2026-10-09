import { useState, useEffect, useCallback } from 'react';

export function useClima() {
  const [clima, setClima] = useState('Buscando localização...');

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

  useEffect(() => {
    buscarClima();
  }, [buscarClima]);

  return { clima, buscarClima };
}
