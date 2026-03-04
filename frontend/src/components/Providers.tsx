'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { authApi, themeApi } from '@/lib/api';
import { CartDrawer } from './cart/CartDrawer';

export function Providers({ children }: { children: React.ReactNode }) {
  const { token, setUser, init } = useAuthStore();
  const { applyTheme } = useThemeStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    init();
    // Ensure session ID for guest cart
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', Math.random().toString(36).slice(2));
    }
  }, []);

  useEffect(() => {
    if (token) {
      authApi.me().then(({ data }) => setUser(data)).catch(() => {});
    }
    fetchCart();
  }, [token]);

  useEffect(() => {
    themeApi.get().then(({ data }) => applyTheme(data)).catch(() => {});
  }, []);

  return (
    <>
      {children}
      <CartDrawer />
      <Toaster position="top-right" />
    </>
  );
}
