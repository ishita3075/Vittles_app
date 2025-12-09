// contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [theme, setTheme] = useState({});

  // Color schemes
  const lightColors = {
    // Primary colors
    primary: '#7494c2ff',
    primaryGradient: ['#8B3358', '#670D2F', '#3A081C'], // Burgundy gradient for navbars
    
    // Background colors
     background: '#f4f4f4',
    card: '#ffffff',
    tabBar: '#ffffff',
    
    // Text colors
    text: '#1a1a1a',
    textSecondary: '#666666',
    
    // UI colors
    border: '#e6e6e6',
    error: '#dc2626',
    white: '#ffffff',
    black: '#000000',
    
    // Semantic colors
    success: '#00a850',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  const darkColors = {
    // Primary colors
    primary: '#00a850',
    primaryGradient: ['#8B3358', '#670D2F', '#3A081C'], // Same gradient for dark mode
    
    // Background colors
    background: '#121212',
    card: '#1e1e1e',
    tabBar: '#1e1e1e',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    
    // UI colors
    border: '#2a2a2a',
    error: '#ef4444',
    white: '#ffffff',
    black: '#000000',
    
    // Semantic colors
    success: '#00a850',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  useEffect(() => {
    setTheme(isDark ? darkColors : lightColors);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    theme,
    toggleTheme,
    colors: theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};