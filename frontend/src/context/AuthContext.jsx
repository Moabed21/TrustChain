import React, { createContext, useState, useContext } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext({
  user: null,
  role: null,
  isLoggedIn: false,
  login: () => { },
  logout: () => { },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trustchain_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [role, setRole] = useState(() => {
    return localStorage.getItem('trustchain_role');
  });

  const login = (email, password) => {
    const foundUser = mockUsers[email];
    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      setRole(foundUser.role);
      localStorage.setItem('trustchain_user', JSON.stringify(foundUser));
      localStorage.setItem('trustchain_role', foundUser.role);
      return foundUser.role;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('trustchain_user');
    localStorage.removeItem('trustchain_role');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);