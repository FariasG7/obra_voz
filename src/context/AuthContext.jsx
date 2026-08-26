import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Restaura a sessão do localStorage/IndexedDB ao carregar o app
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
    // TODO: Substituir pela chamada real da sua API/Supabase
    // Ex: const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    
    if (email && senha) {
      const dadosUsuario = { email, nome: email.split('@')[0], token: 'fake-jwt-token' };
      setUsuario(dadosUsuario);
      localStorage.setItem('obravoz_user', JSON.stringify(dadosUsuario));
      return { sucesso: true };
    }
    return { sucesso: false, erro: 'Credenciais inválidas' };
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('obravoz_user');
  };

  return (
    <AuthContext.Provider value={{ usuario, logado: !!usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
