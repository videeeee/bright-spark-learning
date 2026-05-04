import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';

const TAB_ROUTES: Record<string, string> = {
  home: '/dashboard',
  learn: '/learn',
  notes: '/notes',
  speech: '/speech',
  stats: '/stats',
  leaderboard: '/leaderboard',
  settings: '/settings',
};

const getActiveTab = (pathname: string) => {
  if (pathname.startsWith('/dashboard') || pathname === '/') return 'home';
  if (pathname.startsWith('/learn')) return 'learn';
  if (pathname.startsWith('/notes')) return 'notes';
  if (pathname.startsWith('/speech')) return 'speech';
  if (pathname.startsWith('/stats')) return 'stats';
  if (pathname.startsWith('/leaderboard')) return 'leaderboard';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'home';
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getActiveTab(location.pathname);

  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar activeTab={activeTab} onTabChange={(tab) => navigate(TAB_ROUTES[tab] ?? '/dashboard')} />

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;

