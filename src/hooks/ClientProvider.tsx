import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '@/types';

const STORAGE_KEY = 'ion_client';

interface ClientContextValue {
  theme: Theme;
  zoomLevel: number;
  toggleTheme: () => void;
  setZoomLevel: (level: number) => void;
}

const ClientContext = createContext<ClientContextValue | null>(null);

function loadLocal(): { theme?: Theme; zoomLevel?: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme || undefined,
      zoomLevel: parsed.zoomLevel ?? undefined,
    };
  } catch {
    return {};
  }
}

function saveLocal(data: { theme: Theme; zoomLevel: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* noop */ }
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const saved = loadLocal();
  const [theme, setTheme] = useState<Theme>(saved.theme ?? 'white');
  const [zoomLevel, setZoomLevelState] = useState(saved.zoomLevel ?? 50);

  useEffect(() => {
    saveLocal({ theme, zoomLevel });
  }, [theme, zoomLevel]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'white' ? 'black' : 'white');
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setZoomLevelState(Math.max(10, Math.min(100, level)));
  }, []);

  return (
    <ClientContext.Provider value={{ theme, zoomLevel, toggleTheme, setZoomLevel }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClient must be used within ClientProvider');
  return context;
}
