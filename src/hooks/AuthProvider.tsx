import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChange,
} from '@/lib/supabase';

export interface AuthUser {
  id: string;
  displayName: string;
  planet: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setPlanet: (planet: string) => void;
  setDisplayName: (name: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      if (authUser) {
        setUser({
          id: authUser.id,
          displayName: authUser.display_name,
          planet: authUser.planet,
        });
      } else {
        setUser(null);
        queryClient.clear();
      }
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    queryClient.clear();
  }, []);

  const setPlanet = useCallback((planet: string) => {
    setUser((prev) => (prev ? { ...prev, planet } : prev));
  }, []);

  const setDisplayName = useCallback((displayName: string) => {
    setUser((prev) => (prev ? { ...prev, displayName } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setPlanet, setDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
