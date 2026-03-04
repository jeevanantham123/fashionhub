'use client';

import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCartStore();

  const subtotal = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-heading font-semibold">Shopping Cart ({cart?.items.length || 0})</h2>
          <button onClick={closeCart} className="p-1 hover:opacity-70"><X size={20} /></button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cart?.items.length ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <Link href="/products" onClick={closeCart} className="btn-primary text-sm">Shop Now</Link>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex gap-3">
                <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                  <img src={item.product.images[0] || '/placeholder.jpg'} alt={item.product.name} className="w-20 h-24 object-cover rounded" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="text-sm font-medium line-clamp-2 hover:opacity-70">{item.product.name}</Link>
                  {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant.size} / {item.variant.color}</p>}
                  <p className="text-sm font-semibold mt-1" style={{ color: 'var(--primary)' }}>${item.product.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="ml-auto text-xs text-gray-400 hover:text-red-500"><X size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart?.items.length ? (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between text-sm mb-3">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Shipping and taxes calculated at checkout</p>
            <Link href="/checkout" onClick={closeCart} className="btn-primary w-full block text-center">
              Proceed to Checkout
            </Link>
            <Link href="/cart" onClick={closeCart} className="btn-secondary w-full block text-center mt-2 text-sm">
              View Cart
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
