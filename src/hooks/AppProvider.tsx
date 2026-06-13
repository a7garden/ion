import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAppState } from '@/hooks/useAppState';

const AppContext = createContext<ReturnType<typeof useAppState> | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();
  return (
    <AppContext.Provider value={appState}>
      <div className={appState.state.theme === 'black' ? 'dark' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
