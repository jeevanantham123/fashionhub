import { create } from 'zustand';
import { ThemeSettings } from '@/types';

interface ThemeState {
  theme: ThemeSettings | null;
  setTheme: (theme: ThemeSettings) => void;
  applyTheme: (theme: ThemeSettings) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: null,
  setTheme: (theme) => {
    set({ theme });
  },
  applyTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary', theme['primary-color'] || '#C9A84C');
      root.style.setProperty('--secondary', theme['secondary-color'] || '#1A1A2E');
      root.style.setProperty('--background', theme['background-color'] || '#FAFAF8');
      root.style.setProperty('--text', theme['text-color'] || '#1A1A1A');
      root.style.setProperty('--accent', theme['accent-color'] || '#E8D5A3');
      root.style.setProperty('--heading-font', `"${theme['heading-font'] || 'Playfair Display'}"`);
      root.style.setProperty('--body-font', `"${theme['body-font'] || 'Inter'}"`);
      document.body.style.backgroundColor = theme['background-color'] || '#FAFAF8';
      document.body.style.color = theme['text-color'] || '#1A1A1A';
    }
  },
}));
