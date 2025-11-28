"use client";

import React, { createContext, useContext, useState } from 'react';

// Default theme values
const defaultTheme = {
  colors: {
    primary: '#004D40',      // Primary accent color
    secondary: '#00796B',    // Secondary accent color
    background: '#F5F5F5',   // App background
    cardBg: '#FFFFFF',       // Card background
    text: '#333333',         // Main text color
    textLight: '#757575',    // Secondary text color
    border: '#E0E0E0',       // Border color
    error: '#D32F2F',        // Error color
    success: '#388E3C',      // Success color
    warning: '#FFA000',      // Warning color
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    headings: {
      h1: '2rem',
      h2: '1.75rem',
      h3: '1.5rem',
      h4: '1.25rem',
    },
    body: {
      regular: '1rem',
      small: '0.875rem',
      xs: '0.75rem',
    },
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    large: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
  }
};

// Create the context
const ThemeContext = createContext();

// Theme provider component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  
  // Function to update theme
  const updateTheme = (newThemeValues) => {
    setTheme(prev => ({
      ...prev,
      ...newThemeValues,
      colors: {
        ...prev.colors,
        ...(newThemeValues.colors || {})
      }
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for consuming the theme context
export const useTheme = () => useContext(ThemeContext); 