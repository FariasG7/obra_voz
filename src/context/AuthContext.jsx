import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Restaura a sessão do localStorage ao carregar o app
    const usuarioSalvo = localStorage.getItem('obravoz_user');
    if (usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch (e) {
        localStorage.removeItem('obravoz_user');
      }
    }
    setCarregando(false);
  }, []);

  const login = async (email, senha) => {
    // Simulação de login local (Substituir no futuro por Supabase/Firebase/API)
    const emailLimpo = email ? email.trim() : '';
    const senhaLimpa = senha ? senha.trim() : '';

    if (emailLimpo && senhaLimpa.length >= 4) {
      const dadosUsuario = { 
        email: emailLimpo, 
        nome: emailLimpo.split('@')[0], 
        token: 'fake-jwt-token' 
      };
      
      setUsuario(dadosUsuario);
      localStorage.setItem('obravoz_user', JSON.stringify(dadosUsuario));
      return { sucesso: true };
    }
    
    return { sucesso: false, erro: 'E-mail ou senha inválidos.' };
  };

  const logout = () => {
    setUsuario(null);
    // Limpa a sessão do utilizador
    localStorage.removeItem('obravoz_user');
    
    // Limpa rascunhos de relatórios pendentes ao sair
    localStorage.removeItem('diario_texto');
    localStorage.removeItem('diario_medicoes');
  };

  return (
    <AuthContext.Provider value={{ usuario, logado: !!usuario, login, logout, carregando }}>
      {!carregando && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
