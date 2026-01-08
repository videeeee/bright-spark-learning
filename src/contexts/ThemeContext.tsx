import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

type Theme = 'yellow' | 'orange' | 'green' | 'purple' | 'blue';
// New companions as requested
type Companion = 'solin' | 'pyro' | 'aqua' | 'lumi' | 'verdi';

interface CompanionMeta {
  id: Companion;
  name: string;
  emoji: string;
  description?: string;
  mood: 'motivation' | 'energy' | 'calm' | 'creative' | 'growth';
  theme: Theme;
  colors: string[];
  image?: string; // public path e.g. /companions/solin.png
}

const companionsData: CompanionMeta[] = [
  { id: 'solin', name: 'Solin', emoji: '🌞', description: 'Starter buddy / Daily motivation', mood: 'motivation', theme: 'yellow', colors: ['#FDE68A', '#FBBF24', '#F59E0B'], image: '/companions/solin.png' },
  { id: 'pyro', name: 'Pyro', emoji: '🔥', description: 'Challenge booster', mood: 'energy', theme: 'orange', colors: ['#FFD29C', '#FB923C', '#F97316'], image: '/companions/pyro.png' },
  { id: 'aqua', name: 'Aqua', emoji: '🌊', description: 'Explainer & listener', mood: 'calm', theme: 'blue', colors: ['#BFDBFE', '#60A5FA', '#0EA5E9'], image: '/companions/aqua.png' },
  { id: 'lumi', name: 'Lumi', emoji: '✨', description: 'Notes & storytelling', mood: 'creative', theme: 'purple', colors: ['#FDE8FF', '#C4B5FD', '#A78BFA'], image: '/companions/lumi.png' },
  { id: 'verdi', name: 'Verdi', emoji: '🌿', description: 'Progress tracker & guide', mood: 'growth', theme: 'green', colors: ['#E6F6EA', '#BBF7D0', '#7EE7B5'], image: '/companions/verdi.png' },

];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  companion: Companion;
  setCompanion: (companion: Companion) => void;
  companions: CompanionMeta[];
  getCompanionMeta: (id: Companion) => CompanionMeta | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('yellow');
  const [companionState, setCompanionState] = useState<Companion>('solin');

  useEffect(() => {
    const root = document.documentElement;
    // Remove any existing theme-* classes, then add the current theme class (skip adding for default 'yellow')
    root.classList.remove('theme-blue', 'theme-orange', 'theme-purple', 'theme-green', 'theme-yellow');
    if (theme !== 'yellow') {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Ensure CSS vars and theme are set when companionState initializes or changes
  useEffect(() => {
    const meta = companionsData.find((c) => c.id === companionState);
    if (meta) {
      const root = document.documentElement;
      root.style.setProperty('--companion-color-1', meta.colors[0]);
      root.style.setProperty('--companion-color-2', meta.colors[1]);
      root.style.setProperty('--companion-color-3', meta.colors[2]);
      // ensure theme matches companion on initial load
      setTheme(meta.theme);
    }
  }, [companionState]);

  // When companion changes, automatically update the theme to the companion's theme
  const setCompanion = (companion: Companion) => {
    setCompanionState(companion);
    const meta = companionsData.find((c) => c.id === companion);
    if (meta) {
      setTheme(meta.theme);
      // Optionally, set CSS variables for companion colors (could be used by UI)
      const root = document.documentElement;
      root.style.setProperty('--companion-color-1', meta.colors[0]);
      root.style.setProperty('--companion-color-2', meta.colors[1]);
      root.style.setProperty('--companion-color-3', meta.colors[2]);

      // Show a toast notifying user of the changes
      const moodLabelMap: Record<string, string> = {
        motivation: 'Motivation',
        energy: 'Energy',
        calm: 'Calm',
        creative: 'Creativity',
        growth: 'Growth',
      };

      toast({
        title: `${meta.name} selected`,
        description: `${moodLabelMap[meta.mood] ?? meta.mood} mood — theme switched`,
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, companion: companionState, setCompanion, companions: companionsData, getCompanionMeta: (id) => companionsData.find((c) => c.id === id) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

