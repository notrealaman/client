'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth as authApi } from './api';
import BMIPopup from '@/components/BMIPopup';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password, username) => {
    const data = await authApi.login({ email, password, username });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    await loadUser();
    return data.user;
  };

  const signup = async (name, email, password, role, username) => {
    const data = await authApi.signup({ name, email, password, role, username });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loadUser }}>
      {children}
      <BMIPopup />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
