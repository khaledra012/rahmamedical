import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('daftra_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on initial load or page refresh
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('daftra_token');

      if (savedToken) {
        try {
          // Verify token against backend
          const currentUser = await authService.getMe();
          setUser(currentUser);
          setToken(savedToken);
        } catch (error) {
          console.warn('Session expired or invalid token:', error);
          localStorage.removeItem('daftra_token');
          localStorage.removeItem('daftra_user');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user with credentials
   */
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('daftra_token', data.token);
    localStorage.setItem('daftra_user', JSON.stringify(data.user));
    return data;
  };

  /**
   * Logout user and clear session
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('daftra_token');
    localStorage.removeItem('daftra_user');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
