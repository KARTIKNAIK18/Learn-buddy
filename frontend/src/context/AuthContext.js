import React, { createContext, useContext, useState, useCallback } from 'react';
import { loginUser } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = sessionStorage.getItem('access_token');
      const role  = sessionStorage.getItem('role');
      const email = sessionStorage.getItem('email');
      if (token && role) return { token, role, email };
    } catch (_) {}
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /** Authenticate and persist session */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginUser({ email, password });
      const { access_token, role, email: userEmail } = data;

      sessionStorage.setItem('access_token', access_token);
      sessionStorage.setItem('role', role);
      sessionStorage.setItem('email', userEmail);

      setUser({ token: access_token, role, email: userEmail });
      return role; // caller uses this to redirect
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setUser(null);
  }, []);

  const value = { user, loading, error, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
