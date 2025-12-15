// contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from '../styles/colors';

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
  // Color schemes
  const lightColors = {
    ...colors, // Spread default colors

    // Explicit overrides if needed for light mode
    tabBar: colors.card,
    isDark: false,
  };

  const darkColors = {
    ...colors, // Start with defaults

    // Dark Mode Overrides
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    inputBg: '#1C1C1E',
    tabBar: '#1C1C1E',

    // Keep gradients vibrant even in dark mode
    primaryGradient: ['#1A237E', '#3949AB'],

    isDark: true,
  };

  // Derive theme directly to ensure updates to 'colors.js' are reflected immediately
  const theme = isDark ? darkColors : lightColors;

  // No useEffect needed for syncing theme state

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