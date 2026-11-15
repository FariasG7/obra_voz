// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const salvo = localStorage.getItem('obravoz_usuario_logado');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (dadosUsuario) => {
    setUser(dadosUsuario);
    localStorage.setItem('obravoz_usuario_logado', JSON.stringify(dadosUsuario));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('obravoz_usuario_logado');
    localStorage.removeItem('obravoz_sessao_ativa');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
