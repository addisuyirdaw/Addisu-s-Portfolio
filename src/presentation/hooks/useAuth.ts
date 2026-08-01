/**
 * Presentation Hook: useAuth
 * Presenter for admin authentication state, backed by the AuthGateway port.
 * Subscribes reactively to Supabase onAuthStateChange (handles PASSWORD_RECOVERY events).
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
  resetPasswordForEmail: (email: string) => Promise<void>;
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

    // Subscribe to real-time auth state changes (e.g. PASSWORD_RECOVERY token from email link)
    const { unsubscribe } = authGateway.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        if (session) {
          setUser(session.user || { email: 'admin@addisu.com' });
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

  const resetPasswordForEmail = async (email: string): Promise<void> => {
    const redirectTo = `${window.location.origin}/reset-password`;
    await authGateway.resetPasswordForEmail(email, redirectTo);
  };

  return { isAuthenticated, user, loading, error, loginAttempts, login, logout, resetPasswordForEmail };
}
