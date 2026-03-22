import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  isDark: boolean;
  colors: {
    bg: string;
    surface: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    cardBorder: string;
    primary: string;
    separator: string;
    accent: string;
    green: string;
    red: string;
  };
}

const lightColors = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#111111',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  border: '#E8E8ED',
  cardBorder: '#f8f8f8',
  primary: '#111111',
  separator: '#F0F0F3',
  accent: '#7C6EEA',
  green: '#16A34A',
  red: '#FF3B30',
};

const darkColors = {
  bg: '#000000',
  surface: '#121212',
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
  textTertiary: '#48484A',
  border: '#2C2C2E',
  cardBorder: '#1C1C1E',
  primary: '#FFFFFF',
  separator: '#2C2C2E',
  accent: '#7C6EEA', // Stays same
  green: '#16A34A',  // Stays same
  red: '#FF453A',
};

interface ThemeStore extends Theme {
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      colors: lightColors,
      toggleTheme: () => set((state: ThemeStore) => {
        const nextDark = !state.isDark;
        return {
          isDark: nextDark,
          colors: nextDark ? darkColors : lightColors,
        };
      }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
