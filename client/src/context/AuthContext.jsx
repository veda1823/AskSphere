import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('asksphere_token'));
  const [loading, setLoading] = useState(true);

  // Check if token exists on mount and fetch current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.warn('Session expired or invalid token:', error.response?.data?.message || error.message);
        // Clear invalid token
        localStorage.removeItem('asksphere_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Register function
  const register = async (username, email, password) => {
    const response = await API.post('/auth/register', { username, email, password });
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('asksphere_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  // Login function
  const login = async (identifier, password) => {
    const response = await API.post('/auth/login', { identifier, password });
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('asksphere_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('asksphere_token');
    setToken(null);
    setUser(null);
  };

  // Helper to adjust points locally (e.g. after asking or answering questions)
  const updatePoints = (newPoints) => {
    if (user) {
      setUser((prev) => ({ ...prev, points: newPoints }));
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updatePoints,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
