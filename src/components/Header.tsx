import { useState, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthProvider';
import { useClient } from '@/hooks/ClientProvider';
import { Home, Globe, User, Sun, Moon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { NotificationCenter } from '@/components/NotificationCenter';
import { DevLoginModal } from '@/components/DevLoginModal';
import { cn } from '@/lib/utils';

/** Long-press threshold in ms */
const LONG_PRESS_MS = 1200;

function NavPill({
  to,
  icon: Icon,
  label,
  isActive,
}: {
  to: string;
  icon: typeof Home;
  label: string;
  isActive: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 select-none touch-target',
        isActive
          ? 'text-accent-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {/* Active pill background */}
      {isActive && (
        <span className="absolute inset-0 rounded-full bg-accent shadow-sm" />
      )}
      <Icon
        className={cn(
          'relative w-[18px] h-[18px] transition-transform duration-300',
          isActive && 'scale-110'
        )}
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className="relative hidden sm:inline">{label}</span>
    </NavLink>
  );
}

export function Header() {
  const { user, devLogin } = useAuth();
  const { theme, toggleTheme } = useClient();
  const { t } = useI18n();
  const location = useLocation();
  const isLoggedIn = !!user;
  const [devModalOpen, setDevModalOpen] = useState(false);

  // Determine which nav is active (account for /my)
  const activeNav = location.pathname === '/my' ? '/my' : location.pathname === '/world' ? '/world' : '/';

  // Long-press state for theme toggle button
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  const handleThemePointerDown = useCallback(() => {
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      setDevModalOpen(true);
    }, LONG_PRESS_MS);
  }, []);

  const handleThemePointerUp = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressFired.current) {
      toggleTheme();
    }
  }, [toggleTheme]);

  const handleThemePointerLeave = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-[64px] bg-background/75 backdrop-blur-2xl border-b border-border/40 z-sticky grid grid-cols-3 items-center px-4 sm:px-6 pt-[var(--safe-area-top)]"
      style={{ boxShadow: '0 1px 0 0 oklch(var(--accent) / 0.06), 0 2px 8px 0 oklch(var(--foreground) / 0.04)' }}
    >
      {/* Left: Logo */}
      <div className="flex items-center justify-start">
        <NavLink
          to="/"
          className="group flex items-center gap-2 select-none"
        >
          {/* Decorative accent dot */}
          <span className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/10 ring-1 ring-accent/20 transition-all duration-300 group-hover:bg-accent/15 group-hover:ring-accent/30 group-hover:shadow-[0_0_12px_oklch(var(--accent)/0.15)]">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight transition-colors duration-300 font-display">
            ION
          </span>
        </NavLink>
      </div>

      {/* Center: Nav */}
      <nav className="flex items-center gap-1 justify-self-center">
        <NavPill
          to="/"
          icon={Home}
          label={t('nav.feed')}
          isActive={activeNav === '/'}
        />
        <NavPill
          to="/world"
          icon={Globe}
          label={t('nav.world')}
          isActive={activeNav === '/world'}
        />
        <NavLink
          to="/my"
          className={cn(
            'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 select-none touch-target',
            activeNav === '/my'
              ? 'text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {activeNav === '/my' && (
            <span className="absolute inset-0 rounded-full bg-accent shadow-sm" />
          )}
          <User
            className={cn(
              'relative w-[18px] h-[18px] transition-transform duration-300',
              activeNav === '/my' && 'scale-110'
            )}
            strokeWidth={activeNav === '/my' ? 2.25 : 1.75}
          />
          <span className="relative hidden sm:inline">
            {isLoggedIn ? t('nav.my') : t('nav.login')}
          </span>
        </NavLink>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-0.5">
        {user && <NotificationCenter userId={user.id} />}
        <button
          type="button"
          title={t('header.toggleTheme')}
          onPointerDown={handleThemePointerDown}
          onPointerUp={handleThemePointerUp}
          onPointerLeave={handleThemePointerLeave}
          className="relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 active:scale-95"
        >
          <span
            className={cn(
              'transition-transform duration-500',
              theme === 'white' ? 'rotate-0' : 'rotate-180'
            )}
          >
            {theme === 'white' ? (
              <Moon className="w-[18px] h-[18px]" />
            ) : (
              <Sun className="w-[18px] h-[18px]" />
            )}
          </span>
        </button>
      </div>
      <DevLoginModal open={devModalOpen} onOpenChange={setDevModalOpen} onLogin={devLogin} />
    </header>
  );
}
