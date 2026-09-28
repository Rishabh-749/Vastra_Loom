import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'noir',
    name: 'Royal Noir',
    subtitle: 'Obsidian & Antique Gold',
    icon: 'ri-moon-clear-line',
    accentColor: '#C6A87C',
    canvasColor: '#080806',
    pillText: 'Noir',
  },
  {
    id: 'ivory',
    name: 'Ivory Atelier',
    subtitle: 'Silk Alabaster & Champagne',
    icon: 'ri-sun-line',
    accentColor: '#9E7D47',
    canvasColor: '#FAF8F5',
    pillText: 'Ivory',
  },
  {
    id: 'emerald',
    name: 'Imperial Emerald',
    subtitle: 'Heritage Malachite & Gold',
    icon: 'ri-gemini-line',
    accentColor: '#D4AF37',
    canvasColor: '#04130E',
    pillText: 'Emerald',
  },
];

const ThemeContext = createContext({
  theme: 'noir',
  themeConfig: THEMES[0],
  setTheme: () => {},
  cycleTheme: () => {},
  themes: THEMES,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vastra_theme') || 'noir';
    }
    return 'noir';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vastra_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
