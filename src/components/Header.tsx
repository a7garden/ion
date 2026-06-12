import { useApp } from '@/hooks/AppProvider';
import { Button } from '@/components/ui/button';
import { Home, Globe, User, Sun, Moon } from 'lucide-react';

type View = 'feed' | 'world' | 'my';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLoginClick: () => void;
}

export function Header({ currentView, onViewChange, onLoginClick }: HeaderProps) {
  const { state, toggleTheme } = useApp();

  const isLoggedIn = state.currentUser && state.currentUser !== 'guest';

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-[64px] bg-background/80 backdrop-blur-xl border-b border-border/50 z-[500] flex items-center justify-center px-4 sm:px-6 pt-[var(--safe-area-top)]">
      <div className="flex items-center gap-3 sm:gap-6">
        <div
          className="text-xl sm:text-2xl font-bold cursor-pointer text-foreground tracking-tight hover:text-accent transition-colors duration-300 -translate-x-4/3 mr-2 sm:mr-8"
          onClick={() => onViewChange('feed')}
        >
          <span className="text-gradient-warm">i'm</span> alone
        </div>

        <nav className="flex gap-0.5 sm:gap-1 items-center bg-muted/30 rounded-xl sm:rounded-2xl p-1 border border-border/30">
          <Button
            variant={currentView === 'feed' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('feed')}
            className={`gap-1.5 sm:gap-2 transition-all duration-200 touch-target ${
              currentView === 'feed' ? 'shadow-sm bg-card border border-accent/20' : ''
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Feed</span>
            {currentView === 'feed' && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            )}
          </Button>
          <Button
            variant={currentView === 'world' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('world')}
            className={`gap-1.5 sm:gap-2 transition-all duration-200 touch-target ${
              currentView === 'world' ? 'shadow-sm bg-card border border-accent/20' : ''
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">World</span>
            {currentView === 'world' && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            )}
          </Button>
          <Button
            variant={currentView === 'my' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => isLoggedIn ? onViewChange('my') : onLoginClick()}
            className={`gap-1.5 sm:gap-2 transition-all duration-200 touch-target ${
              currentView === 'my' ? 'shadow-sm bg-card border border-accent/20' : ''
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{isLoggedIn ? 'My' : 'Login'}</span>
            {currentView === 'my' && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            )}
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Toggle Theme"
          className="ml-2 sm:ml-4 hover:bg-accent/10 hover:text-accent transition-all duration-300 touch-target"
        >
          {state.theme === 'white' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  );
}