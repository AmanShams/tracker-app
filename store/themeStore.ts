import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'light-dark-nav' | 'dark-light-nav';

export interface ThemeColors {
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
  navBg: string;
  navActive: string;
  navInactive: string;
  beltBg: string;
  beltInnerBg: string;
  beltText: string;
  beltIconBg: string;
  beltBorder: string;
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
  bg: '#1C1C1E',
  surface: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
  textTertiary: '#48484A',
  border: '#3A3A3C',
  cardBorder: '#3A3A3C',
  primary: '#FFFFFF',
  separator: '#3A3A3C',
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
  beltInnerBg: '#FFFFFF', // Pure white buttons as requested
  beltText: '#111111',
  beltIconBg: '#F2F2F7', // Slightly grey icon circle
  beltBorder: 'rgba(17,17,17,0.1)', // Subtle border for definition on white
};

const beltDark = {
  beltBg: '#000000',
  beltInnerBg: '#000000',
  beltText: '#FFFFFF',
  beltIconBg: '#1C1C1E',
  beltBorder: 'rgba(255,255,255,0.12)',
};

export const themes: Record<ThemeMode, { isDark: boolean; colors: ThemeColors }> = {
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

interface ThemeStore {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
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
        const idx = themeOrder.indexOf(state.mode);
        const nextMode = themeOrder[(idx + 1) % themeOrder.length];
        return { mode: nextMode, ...themes[nextMode] };
      }),
    }),
    {
      name: 'theme-storage-vfinal-4', // Hard reset for the pure white update
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
