import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'yellow' | 'blue';
type Companion = 'monkey' | 'fox' | 'doraemon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  companion: Companion;
  setCompanion: (companion: Companion) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('yellow');
  const [companion, setCompanion] = useState<Companion>('monkey');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'blue') {
      root.classList.add('theme-blue');
    } else {
      root.classList.remove('theme-blue');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, companion, setCompanion }}>
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
