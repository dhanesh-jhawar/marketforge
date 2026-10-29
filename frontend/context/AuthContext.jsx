'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setApiToken, getApiToken } from '../lib/api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getApiToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const u = await apiClient('/auth/me');
        setUser(u);
      } catch {
        setUser(null);
        setApiToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient('/auth/login', { method: 'POST', body: { email, password } });
    setApiToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (email, password, displayName) => {
    const res = await apiClient('/auth/register', { method: 'POST', body: { email, password, displayName } });
    setApiToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setApiToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
