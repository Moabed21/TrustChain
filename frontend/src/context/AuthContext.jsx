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
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const login = (email, password) => {
    const foundUser = mockUsers[email];
    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      setRole(foundUser.role);
      return foundUser.role; // return role so caller can navigate
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);