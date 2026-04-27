import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMeRequest, loginRequest, logoutRequest } from '../services/auth';

const AuthContext = createContext({
  user: null,
  role: null,
  isLoggedIn: false,
  token: null,
  isAuthLoading: true,
  login: () => { },
  logout: () => { },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const me = await getMeRequest(savedToken);
        const sessionUser = {
          id: me.id,
          email: me.email,
          name: me.email?.split('@')?.[0] || 'User',
          role: me.role,
          status: me.status ?? null,
          walletAddress: me.wallet_address ?? null,
        };

        setToken(savedToken);
        setRole(me.role);
        setUser(sessionUser);
      } catch (_error) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    const sessionUser = {
      email: data.email,
      name: data.email?.split('@')?.[0] || 'User',
      role: data.role,
    };

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('email', data.email);

    setToken(data.access_token);
    setRole(data.role);
    setUser(sessionUser);

    return data;
  };

  const logout = async () => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      try {
        await logoutRequest(currentToken);
      } catch (_error) {
        // Local logout should still succeed even if API call fails.
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');

    setUser(null);
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isAuthLoading, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);