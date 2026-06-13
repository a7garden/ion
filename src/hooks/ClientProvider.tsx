import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'ion_client';

interface ClientContextValue {
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
}

const ClientContext = createContext<ClientContextValue | null>(null);

function loadLocal(): { zoomLevel?: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      zoomLevel: parsed.zoomLevel ?? undefined,
    };
  } catch {
    return {};
  }
}

function saveLocal(data: { zoomLevel: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* noop */ }
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const saved = loadLocal();
  const [zoomLevel, setZoomLevelState] = useState(saved.zoomLevel ?? 50);

  useEffect(() => {
    saveLocal({ zoomLevel });
  }, [zoomLevel]);

  const setZoomLevel = useCallback((level: number) => {
    setZoomLevelState(Math.max(10, Math.min(100, level)));
  }, []);

  return (
    <ClientContext.Provider value={{ zoomLevel, setZoomLevel }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClient must be used within ClientProvider');
  return context;
}
