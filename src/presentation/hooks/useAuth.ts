/**
 * Presentation Hook: useAuth
 * Presenter for admin authentication state, backed by the AuthGateway port.
 */

import { useState, useEffect, useCallback } from 'react';
import { authGateway } from '../../infrastructure/gateways';

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const session = await authGateway.getSession();
      if (session) {
        const currentUser = session.user || { email: 'admin@addisu.com' };
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      const result = await authGateway.login(email, password);
      setUser(result.user);
      setIsAuthenticated(true);
      setLoginAttempts(0);
    } catch (err: any) {
      setLoginAttempts(prev => prev + 1);
      setError(err.message || 'Authentication failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authGateway.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, user, loading, error, loginAttempts, login, logout };
}
