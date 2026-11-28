import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('dark');
    root.classList.add('light');
    body.classList.remove('bg-slate-950', 'text-slate-100', 'dark');
    body.classList.add('bg-white', 'text-[#0E172A]');
  }, [theme]);

  const toggleTheme = () => {
    setThemeState('light');
  };

  const setTheme = (_mode: ThemeMode) => {
    setThemeState('light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
