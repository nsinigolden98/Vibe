import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Mood } from '@/types';
import { MOOD_COLORS } from '@/types';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentMood: Mood | null;
  setMood: (mood: Mood | null) => void;
  moodColor: string;
  primaryColor: string;
  soundEnabled: boolean;
  toggleSound: () => void;
  canDisableSound: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; isPremium: boolean }> = ({ 
  children, 
  isPremium 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Check localStorage for preferences
    const savedDarkMode = localStorage.getItem('vibe-dark-mode');
    const savedSound = localStorage.getItem('vibe-sound-enabled');
    
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    }
    
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('vibe-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('vibe-sound-enabled', soundEnabled.toString());
  }, [soundEnabled]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const setMood = useCallback((mood: Mood | null) => {
    setCurrentMood(mood);
    
    // Apply mood-based theming for premium users
    if (isPremium && mood) {
      const color = MOOD_COLORS[mood];
      document.documentElement.style.setProperty('--mood-color', color);
    }
  }, [isPremium]);

  const toggleSound = () => {
    // Only premium users can disable sound
    if (!isPremium && soundEnabled) {
      return; // Can't turn off sound as free user
    }
    setSoundEnabled(prev => !prev);
  };

  const moodColor = currentMood ? MOOD_COLORS[currentMood] : '#ff2e2e';
  const primaryColor = isPremium && currentMood ? moodColor : '#ff2e2e';

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        currentMood,
        setMood,
        moodColor,
        primaryColor,
        soundEnabled,
        toggleSound,
        canDisableSound: isPremium
      }}
    >
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
