import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Accent = 'indigo' | 'emerald' | 'violet' | 'crimson';

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) { /* ignore localStorage errors in restricted environments */ }
    // Fallback to system preference (safely)
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
    } catch (_) { /* ignore matchMedia errors */ }
    return 'dark';
  });

  const [accent, setAccentState] = useState<Accent>(() => {
    try {
      const saved = localStorage.getItem('portfolio_accent');
      if (saved === 'indigo' || saved === 'emerald' || saved === 'violet' || saved === 'crimson') return saved;
    } catch (_) { /* ignore localStorage errors */ }
    return 'violet';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accent);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    localStorage.setItem('portfolio_accent', accent);
  }, [accent]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setAccent = (newAccent: Accent) => {
    setAccentState(newAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
