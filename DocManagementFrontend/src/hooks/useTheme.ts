import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if there's a saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    // If no saved preference, check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  });
  
  // Update the DOM when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Save the theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Function to change the theme
  const setThemePreference = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  return { theme, setTheme: setThemePreference };
} 