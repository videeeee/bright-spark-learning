import React from 'react';
import { Home, BookOpen, Mic, BarChart3, Trophy, Settings, Bot, Search } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type Tab = 'home' | 'learn' | 'notes' | 'speech' | 'stats' | 'leaderboard' | 'settings';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: Bot },
  { id: 'speech', label: 'Speech', icon: Mic },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { companion } = useTheme();

  return (
    <div className="flex h-full">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border/60 p-4 space-y-6 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2">
            <img src="/logo.svg" alt="Pippa Logo" className="w-10 h-10"/>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tighter">Pippa</h1>
        </div>
        <nav className="flex flex-col space-y-2 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as Tab)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 font-bold text-lg transition-all duration-200',
                activeTab === item.id
                  ? 'bg-primary/10 text-primary shadow-cute -translate-x-1'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto">
            <button
              onClick={() => onTabChange('settings')}
               className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 font-bold text-lg transition-all duration-200 w-full',
                activeTab === 'settings'
                  ? 'bg-primary/10 text-primary shadow-cute -translate-x-1'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
                <Settings className="w-6 h-6" />
                <span>Settings</span>
            </button>
        </div>
      </aside>

      {/* --- Mobile Top Bar & Bottom Nav --- */}
      <div className="lg:hidden flex flex-col w-full">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 border-b border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
             <img src="/logo.svg" alt="Pippa Logo" className="w-9 h-9"/>
             <h1 className="text-xl font-extrabold text-foreground tracking-tighter">Pippa</h1>
          </div>
          <button onClick={() => onTabChange('settings')} className="p-2 rounded-full hover:bg-muted">
             <CompanionAvatar companionId={companion.id} size="sm"/>
          </button>
        </header>
        
        {/* Spacer to push content down */}
        <div className="flex-1 overflow-y-auto"></div>

        {/* Bottom Nav */}
        <nav className="flex justify-around p-2 border-t border-border/60 bg-background/90 backdrop-blur-sm">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as Tab)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200',
                activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
