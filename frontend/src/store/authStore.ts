import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token });
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      set({ token, isLoading: false });
    }
  },
}));
