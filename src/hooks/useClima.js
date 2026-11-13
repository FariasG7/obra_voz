import { useState, useEffect, useCallback } from 'react';

export function useClima() {
  const [clima, setClima] = useState('Buscando localização...');
  const [carregando, setCarregando] = useState<boolean>(true);

  const buscarClima = useCallback(async () => {
    if (!navigator.geolocation) {
      setClima("GPS Indisponível");
      setCarregando(false);
      return;
    }

    setCarregando(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const apiKey = import.meta.env.VITE_WEATHER_API_KEY || "5d69641538ee4295a9ffc578b22ad484";
          
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`
          );
          
          if (!res.ok) throw new Error('Falha na resposta da API');

          const data = await res.json();
          const temperatura = Math.round(data.main.temp);
          const descricao = data.weather[0].description;
          
          // Capitaliza a primeira letra da descrição (ex: "céu limpo" -> "Céu limpo")
          const descricaoFormatada = descricao.charAt(0).toUpperCase() + descricao.slice(1);

          setClima(`${temperatura}°C | ${descricaoFormatada}`);
        } catch (error) {
          console.error("Erro ao buscar dados do clima:", error);
          setClima("Clima indisponível");
        } finally {
          setCarregando(false);
        }
      },
      (error) => {
        console.warn("Permissão de GPS recusada ou erro de geolocalização:", error.message);
        setClima("Localização desativada");
        setCarregando(false);
      },
      { timeout: 10000, maximumAge: 60000 } // Timeout de 10s e cache de 1 min para poupar bateria
    );
  }, []);

  useEffect(() => {
    buscarClima();
  }, [buscarClima]);

  return { clima, carregando, buscarClima };
}
