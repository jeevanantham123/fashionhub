import { create } from 'zustand';
import { Cart } from '@/types';
import { cartApi } from '@/lib/api';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const { data } = await cartApi.get();
      set({ cart: data });
    } catch {}
    finally { set({ isLoading: false }); }
  },
  addItem: async (productId, variantId, quantity = 1) => {
    const { data } = await cartApi.addItem({ productId, variantId, quantity });
    set({ cart: data, isOpen: true });
  },
  updateItem: async (itemId, quantity) => {
    const { data } = await cartApi.updateItem(itemId, quantity);
    set({ cart: data });
  },
  removeItem: async (itemId) => {
    const { data } = await cartApi.removeItem(itemId);
    set({ cart: data });
  },
  clearCart: async () => {
    await cartApi.clear();
    set({ cart: null });
  },
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
