import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 grain-overlay">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 opacity-30" />
      </div>
      <Header />
      <Outlet />
      <Toaster />
    </div>
  );
}
