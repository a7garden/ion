import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';
import { useTheme, Button } from '@/design-system';
import { Home, Globe, User, Sun, Moon, Languages } from 'lucide-react';
import { useI18n } from '@/i18n';
import { ResonanceNotification } from '@/components/ResonanceNotification';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, locale, toggleLocale } = useI18n();
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
                size="small"
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
                size="small"
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
                size="small"
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

        {user && <ResonanceNotification userId={user.id} />}
        <Button
          variant="ghost"
          className="ml-1 sm:ml-2 hover:bg-accent/10 hover:text-accent transition-all duration-300 touch-target w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)]"
          onClick={toggleLocale}
          title={locale === 'ko' ? 'English' : '한국어'}
        >
          <Languages className="w-4 h-4" />
          <span className="text-[10px] font-bold ml-0.5">{locale === 'ko' ? 'EN' : 'KO'}</span>
        </Button>
        <Button
          variant="ghost"
          className="ml-1 sm:ml-2 hover:bg-accent/10 hover:text-accent transition-all duration-300 touch-target w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)]"
          onClick={toggleTheme}
          title={t('header.toggleTheme')}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
