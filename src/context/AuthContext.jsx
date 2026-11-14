import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { autenticarUtilizador } from '../db/usuarioService';

const AuthContext = createContext({});

const TEMPO_TURNO_MS = 8 * 60 * 60 * 1000; // 8 horas de turno
const HORA_LIMITE_NOTURNA = 19; // 19:00h

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem('obravoz_user');
    sessionStorage.removeItem('obravoz_user');
    
    localStorage.removeItem('diario_texto');
    localStorage.removeItem('diario_medicoes');
    localStorage.removeItem('obravoz_sessao_ativa');
  }, []);

  const validarEMigrarSessao = useCallback(() => {
    const agora = new Date();
    const timestampAtual = agora.getTime();
    const ehHorarioNoturno = agora.getHours() >= HORA_LIMITE_NOTURNA;

    const salvoLocal = localStorage.getItem('obravoz_user');
    if (salvoLocal) {
      try {
        const dados = JSON.parse(salvoLocal);
        if (dados.expiraEm && timestampAtual > dados.expiraEm) {
          logout();
          return null;
        }
        if (ehHorarioNoturno) {
          sessionStorage.setItem('obravoz_user', JSON.stringify(dados));
          localStorage.removeItem('obravoz_user');
        }
        return dados;
      } catch {
        localStorage.removeItem('obravoz_user');
      }
    }

    const salvoSessao = sessionStorage.getItem('obravoz_user');
    if (salvoSessao) {
      try {
        const dados = JSON.parse(salvoSessao);
        if (dados.expiraEm && timestampAtual > dados.expiraEm) {
          logout();
          return null;
        }
        return dados;
      } catch {
        sessionStorage.removeItem('obravoz_user');
      }
    }

    return null;
  }, [logout]);

  useEffect(() => {
    const sessaoValida = validarEMigrarSessao();
    setUsuario(sessaoValida);
    setCarregando(false);
  }, [validarEMigrarSessao]);

  useEffect(() => {
    if (!usuario) return;

    const intervalo = setInterval(() => {
      const sessaoAindaValida = validarEMigrarSessao();
      if (!sessaoAindaValida) {
        setUsuario(null);
      }
    }, 60 * 1000);

    return () => clearInterval(intervalo);
  }, [usuario, validarEMigrarSessao]);

  const login = async (email, senha) => {
    const resultado = await autenticarUtilizador(email, senha);

    if (resultado.sucesso) {
      const agora = new Date();
      const dadosUsuario = { 
        id: resultado.usuario.id,
        email: resultado.usuario.email, 
        nome: resultado.usuario.nome || email.split('@')[0], 
        permissao: resultado.usuario.permissao || 'user',
        token: 'neon-db-session',
        expiraEm: agora.getTime() + TEMPO_TURNO_MS
      };
      
      setUsuario(dadosUsuario);

      if (agora.getHours() >= HORA_LIMITE_NOTURNA) {
        sessionStorage.setItem('obravoz_user', JSON.stringify(dadosUsuario));
        localStorage.removeItem('obravoz_user');
      } else {
        localStorage.setItem('obravoz_user', JSON.stringify(dadosUsuario));
        sessionStorage.removeItem('obravoz_user');
      }

      return { sucesso: true };
    }
    
    return { sucesso: false, erro: resultado.erro || 'E-mail ou senha inválidos.' };
  };

  return (
    <AuthContext.Provider value={{ usuario, logado: !!usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
