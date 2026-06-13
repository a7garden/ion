import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';
import { useClient } from '@/hooks/ClientProvider';
import { Button } from '@/components/ui/button';
import { Home, Globe, User, Sun, Moon } from 'lucide-react';
import { ResonanceNotification } from '@/components/ResonanceNotification';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useClient();
  const isLoggedIn = !!user;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-[64px] bg-background/80 backdrop-blur-xl border-b border-border/50 z-[500] flex items-center justify-center px-4 sm:px-6 pt-[var(--safe-area-top)]">
      <div className="flex items-center gap-3 sm:gap-6">
        <NavLink
          to="/"
          className="text-xl sm:text-2xl font-bold text-foreground tracking-tight hover:text-accent transition-colors duration-300 -translate-x-4/3 mr-2 sm:mr-8"
        >
          ION
        </NavLink>

        <nav className="flex gap-0.5 sm:gap-1 items-center bg-muted/30 rounded-xl sm:rounded-2xl p-1 border border-border/30">
          <NavLink to="/">
            {({ isActive }) => (
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className={`gap-1.5 sm:gap-2 transition-all duration-200 touch-target ${
                  isActive ? 'shadow-sm bg-card border border-accent/20' : ''
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                )}
              </Button>
            )}
          </NavLink>
          <NavLink to="/world">
            {({ isActive }) => (
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className={`gap-1.5 sm:gap-2 transition-all duration-200 touch-target ${
                  isActive ? 'shadow-sm bg-card border border-accent/20' : ''
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">World</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                )}
              </Button>
            )}
          </NavLink>
          <NavLink to={isLoggedIn ? '/my' : '/'} onClick={(e) => { if (!isLoggedIn) e.preventDefault(); }}>
            {({ isActive }) => (
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className={`gap-1.5 sm:gap-2 transition-all duration-200 touch-target ${
                  isActive ? 'shadow-sm bg-card border border-accent/20' : ''
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{isLoggedIn ? 'My' : 'Login'}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                )}
              </Button>
            )}
          </NavLink>
        </nav>

        {user && <ResonanceNotification userId={user.id} />}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Toggle Theme"
          className="ml-2 sm:ml-4 hover:bg-accent/10 hover:text-accent transition-all duration-300 touch-target"
        >
          {theme === 'white' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
