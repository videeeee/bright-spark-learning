import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// The interfaces for Companion and ContextType remain the same.
export interface Companion {
  id: string;
  name: string;
  image: string;
  theme: string;
  mood: string;
  welcomeMessage: string;
  // The quotes object is kept for type safety, but will be simplified.
  quotes: {
    welcome: string[];
    encouragement: string[];
    completion: string[];
  };
}

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  companion: Companion;
  setCompanion: (companionId: string) => void;
  companions: Companion[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// DIAGNOSTIC STEP: The companion data is being radically simplified to remove any
// possibility of a hidden syntax error in the strings.
const defaultCompanions: Companion[] = [
    {
      id: 'solin',
      name: 'Solin',
      image: '/companions/solin.png',
      theme: 'yellow',
      mood: 'Cheerful',
      welcomeMessage: 'Hello!',
      quotes: { welcome: [], encouragement: [], completion: [] },
    },
    {
      id: 'pyro',
      name: 'Pyro',
      image: '/companions/pyro.png',
      theme: 'orange',
      mood: 'Bold',
      welcomeMessage: 'Hello!',
      quotes: { welcome: [], encouragement: [], completion: [] },
    },
    {
      id: 'aqua',
      name: 'Aqua',
      image: '/companions/aqua.png',
      theme: 'blue',
      mood: 'Chill',
      welcomeMessage: 'Hello!',
      quotes: { welcome: [], encouragement: [], completion: [] },
    },
    {
      id: 'lumi',
      name: 'Lumi',
      image: '/companions/lumi.png',
      theme: 'purple',
      mood: 'Expressive',
      welcomeMessage: 'Hello!',
      quotes: { welcome: [], encouragement: [], completion: [] },
    },
    {
      id: 'verdi',
      name: 'Verdi',
      image: '/companions/verdi.png',
      theme: 'green',
      mood: 'Wise',
      welcomeMessage: 'Hello!',
      quotes: { welcome: [], encouragement: [], completion: [] },
    },
];

const initialCompanion = defaultCompanions[0];

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState(initialCompanion.theme);
  const [companion, setCompanionState] = useState<Companion>(initialCompanion);

  useEffect(() => {
    try {
      const savedCompanionId = localStorage.getItem('app-companion') || initialCompanion.id;
      const savedCompanion = defaultCompanions.find(c => c.id === savedCompanionId) || initialCompanion;
      
      document.body.className = `theme-${savedCompanion.theme}`;
      setCompanionState(savedCompanion);
      setThemeState(savedCompanion.theme);

    } catch (error) {
      console.error("Failed to sync theme from localStorage.", error);
    }
  }, []);

  const setTheme = (newTheme: string) => {
    try {
      localStorage.setItem('app-theme', newTheme);
      document.body.className = `theme-${newTheme}`;
      setThemeState(newTheme);
    } catch (error) {
      console.error("Failed to set theme.", error);
    }
  };

  const setCompanion = useCallback((companionId: string) => {
    const newCompanion = defaultCompanions.find(c => c.id === companionId);
    if (newCompanion) {
      try {
        localStorage.setItem('app-companion', companionId);
        setCompanionState(newCompanion);
        setTheme(newCompanion.theme);
      } catch (error) {
        console.error("Failed to set companion.", error);
      }
    }
  }, []);

  const value = { theme, setTheme, companion, setCompanion, companions: defaultCompanions };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
