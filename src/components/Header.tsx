import { useApp } from '@/hooks/AppProvider';
import { Button } from '@/components/ui/button';
import { Home, Globe, User, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

type View = 'feed' | 'world' | 'my';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLoginClick: () => void;
}

export function Header({ currentView, onViewChange, onLoginClick }: HeaderProps) {
  const { state, toggleTheme, toggleSidebar } = useApp();

  const isLoggedIn = state.currentUser && state.currentUser !== 'guest';

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-background border-b border-border z-[100] flex items-center justify-between px-6 transition-colors duration-300">
      <div
        className="text-xl font-bold cursor-pointer text-foreground"
        onClick={() => onViewChange('feed')}
      >
        i'm alone
      </div>

      <nav className="flex gap-1 items-center bg-muted/30 rounded-lg p-1">
        <Button
          variant={currentView === 'feed' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('feed')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Feed</span>
        </Button>
        <Button
          variant={currentView === 'world' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('world')}
          className="gap-2"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">World</span>
        </Button>
        <Button
          variant={currentView === 'my' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => isLoggedIn ? onViewChange('my') : onLoginClick()}
          className="gap-2"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{isLoggedIn ? 'My' : 'Login'}</span>
        </Button>
      </nav>

      <div className="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {state.theme === 'white' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title="Toggle Friends"
        >
          {state.sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  );
}