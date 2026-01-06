import React from 'react';
import { Home, BookOpen, FileText, Volume2, BarChart3, Trophy, Settings, Flame } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'speech', label: 'Listen', icon: Volume2 },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'leaderboard', label: 'Leaders', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-20 lg:w-64 min-h-screen bg-card border-r-2 border-border flex flex-col items-center lg:items-stretch py-6 px-2 lg:px-4">
      {/* Logo & Streak */}
      <div className="flex flex-col items-center lg:items-start gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-cartoon">
            <span className="text-2xl">📚</span>
          </div>
          <span className="hidden lg:block font-bold text-xl text-foreground">LearnQuest</span>
        </div>
        
        {/* Streak Counter */}
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
          <Flame className="w-5 h-5 text-streak streak-fire" />
          <span className="hidden lg:block font-bold text-foreground">12 day streak!</span>
          <span className="lg:hidden font-bold text-foreground text-sm">12</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isActive
                  ? 'gradient-primary text-primary-foreground shadow-cartoon'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Companion */}
      <div className="mt-auto pt-6">
        <CompanionAvatar size="md" />
      </div>
    </aside>
  );
}
