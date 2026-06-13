import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Toaster } from 'sonner';
import { useClient } from '@/hooks/ClientProvider';

export function Layout() {
  const { theme } = useClient();

  useEffect(() => {
    if (theme === 'black') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-500 grain-overlay ${theme === 'black' ? 'dark' : ''}`}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 opacity-30" />
      </div>
      <Header />
      <Outlet />
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
