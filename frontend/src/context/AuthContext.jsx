import React, { createContext, useState, useContext } from "react";
import {
  loginAPI,
  getMeAPI,
  logoutAPI,
  storeAuthToken,
  clearAuthData,
} from "../services/api";

const AuthContext = createContext({
  user: null,
  role: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("trustchain_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("trustchain_role");
  });

  // calls the real backend login endpoint then fetches the user profile
  const login = async (email, password) => {
    // Step 1: authenticate and get the JWT token
    const loginData = await loginAPI(email, password);
    storeAuthToken(loginData.access_token);

    //fetch the full user profile using the token
    const profile = await getMeAPI();

    const userData = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      status: profile.status,
      wallet_address: profile.wallet_address,
      university_name: profile.university_name || null,
    };

    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("trustchain_user", JSON.stringify(userData));
    localStorage.setItem("trustchain_role", userData.role);

    return userData.role;
  };

  // re-fetch user profile from backend
  const refreshUser = async () => {
    const profile = await getMeAPI();
    const userData = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      status: profile.status,
      wallet_address: profile.wallet_address,
      university_name: profile.university_name || null,
    };
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("trustchain_user", JSON.stringify(userData));
    localStorage.setItem("trustchain_role", userData.role);
  };

  // update user data locally without a network call
  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("trustchain_user", JSON.stringify(updated));
      return updated;
    });
  };

  // calls the backend logout endpoint and clears local state
  const logout = async () => {
    try {
      await logoutAPI();
    } catch {
      clearAuthData();
    }
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
