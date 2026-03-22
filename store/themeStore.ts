import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'light-dark-nav' | 'dark-light-nav';

export interface Theme {
  mode: ThemeMode;
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
    // Dynamic Nav Bar and Belt Colors
    navBg: string;
    navActive: string;
    navInactive: string;
    beltBg: string;
    beltInnerBg: string;
    beltText: string;
    beltIconBg: string;
    beltBorder: string;
  };
}

const baseLight = {
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

const baseDark = {
  bg: '#000000',
  surface: '#121212',
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
  textTertiary: '#48484A',
  border: '#2C2C2E',
  cardBorder: '#1C1C1E',
  primary: '#FFFFFF',
  separator: '#2C2C2E',
  accent: '#7C6EEA',
  green: '#16A34A',
  red: '#FF453A',
};

const navLight = {
  navBg: '#FFFFFF',
  navActive: '#111111',
  navInactive: 'rgba(17,17,17,0.4)',
};

const navDark = {
  navBg: '#000000',
  navActive: '#FFFFFF',
  navInactive: 'rgba(255,255,255,0.4)',
};

const beltLight = {
  beltBg: '#FFFFFF',
  beltInnerBg: '#F2F2F7',
  beltText: '#111111',
  beltIconBg: '#E8E8ED',
  beltBorder: 'rgba(17,17,17,0.08)',
};

const beltDark = {
  beltBg: '#000000',
  beltInnerBg: '#1C1C1E',
  beltText: '#FFFFFF',
  beltIconBg: '#262628',
  beltBorder: 'rgba(255,255,255,0.08)',
};

export const themes: Record<ThemeMode, Omit<Theme, 'mode'>> = {
  'dark': {
    isDark: true,
    colors: { ...baseDark, ...navDark, ...beltDark },
  },
  'light': {
    isDark: false,
    colors: { ...baseLight, ...navLight, ...beltLight },
  },
  'light-dark-nav': {
    isDark: false,
    colors: { ...baseLight, ...navDark, ...beltDark },
  },
  'dark-light-nav': {
    isDark: true,
    colors: { ...baseDark, ...navLight, ...beltLight },
  },
};

interface ThemeStore extends Theme {
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const themeOrder: ThemeMode[] = ['light-dark-nav', 'light', 'dark', 'dark-light-nav'];

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light-dark-nav',
      ...themes['light-dark-nav'],
      setMode: (newMode) => set({ mode: newMode, ...themes[newMode] }),
      toggleTheme: () => set((state) => {
        const idx = themeOrder.indexOf(state?.mode || 'light-dark-nav');
        const nextMode = themeOrder[(idx + 1) % themeOrder.length];
        return { mode: nextMode, ...themes[nextMode] };
      }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
