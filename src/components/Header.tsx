import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';
import { useClient } from '@/hooks/ClientProvider';
import { Button } from '@/components/ui/button';
import { Home, Globe, User, Sun, Moon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { NotificationCenter } from '@/components/NotificationCenter';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useClient();
  const { t } = useI18n();
  const isLoggedIn = !!user;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-[64px] bg-background/80 backdrop-blur-xl border-b border-border/50 z-modal grid grid-cols-3 items-center px-4 sm:px-6 pt-[var(--safe-area-top)]">
      {/* Left: Logo */}
      <div className="flex items-center justify-start">
        <NavLink
          to="/"
          className="text-xl sm:text-2xl font-bold text-foreground tracking-tight hover:text-accent transition-colors duration-300"
        >
          ION
        </NavLink>
      </div>

      {/* Center: Nav */}
      <nav className="flex gap-0.5 sm:gap-1 items-center bg-muted/30 rounded-xl sm:rounded-2xl p-1 border border-border/30 justify-self-center">
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
              <span className="hidden sm:inline">{t('nav.feed')}</span>
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
              <span className="hidden sm:inline">{t('nav.world')}</span>
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
              <span className="hidden sm:inline">{isLoggedIn ? t('nav.my') : t('nav.login')}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
              )}
            </Button>
          )}
        </NavLink>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-1">
        {user && <NotificationCenter userId={user.id} />}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={t('header.toggleTheme')}
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
