import { useState, useCallback, type ReactNode } from 'react';
import type { AuthResponse, UserRole } from '../types';
import { authApi } from '../api';
import { AuthContext } from './auth-context';

const STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userId: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        registryId: response.registryId,
        registryName: response.registryName,
        headOfficeRole: response.headOfficeRole,
      }));
      setUser(response);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  }, []);

  const hasRole = useCallback((...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
