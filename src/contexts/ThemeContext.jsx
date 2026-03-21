import { createContext, useContext, useState, useEffect } from 'react';
import { THEMES } from '../styles/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage, default to dark
    const saved = localStorage.getItem('microgpt-theme');
    if (saved && THEMES[saved]) return saved;
    return 'dark';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('microgpt-theme', theme);

    // Set data-theme attribute on document root
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const colors = THEMES[theme]?.colors || THEMES.dark.colors;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
