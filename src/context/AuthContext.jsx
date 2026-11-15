// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe um utilizador guardado (ex: localStorage ou sessão)
    try {
      const usuarioSalvo = localStorage.getItem('diario_usuario');
      if (usuarioSalvo) {
        setUser(JSON.parse(usuarioSalvo));
      }
    } catch (err) {
      console.error("Erro ao carregar sessão:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, senha) => {
    // Exemplo de lógica de login (substitua pela sua chamada real ou Firebase/Supabase/Neon)
    try {
      // Simulação de autenticação bem-sucedida
      const dadosUsuario = { email, nome: email.split('@')[0] };
      setUser(dadosUsuario);
      localStorage.setItem('diario_usuario', JSON.stringify(dadosUsuario));
      return { sucesso: true };
    } catch (err) {
      return { sucesso: false, erro: 'Credenciais inválidas.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('diario_usuario');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
