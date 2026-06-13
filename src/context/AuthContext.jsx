import React, { createContext, useState, useContext } from "react";
import { USER } from "../data/mockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = (email, password) => {
    setLoading(true);
    // Mock login
    setTimeout(() => {
      setUser(USER);
      setLoading(false);
    }, 1000);
  };

  const logout = () => setUser(null);

  const signup = (userData) => {
    setLoading(true);
    setTimeout(() => {
      setUser({ ...USER, ...userData });
      setLoading(false);
    }, 1500);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
