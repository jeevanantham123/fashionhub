'use client';

import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function CartPage() {
  const { cart, updateItem, removeItem } = useCartStore();
  const subtotal = cart?.items.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0;

  if (!cart?.items.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" strokeWidth={1} />
        <h1 className="text-2xl font-heading font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some items to your cart to get started.</p>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-heading font-bold mb-6">Shopping Cart ({cart.items.length})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="flex gap-4 border rounded-lg p-4">
              <Link href={`/products/${item.product.slug}`}>
                <img src={item.product.images[0]} alt={item.product.name} className="w-24 h-28 object-cover rounded" />
              </Link>
              <div className="flex-1">
                <Link href={`/products/${item.product.slug}`} className="font-medium hover:opacity-70">{item.product.name}</Link>
                {item.variant && <p className="text-sm text-gray-500 mt-0.5">{item.variant.size} / {item.variant.color}</p>}
                <p className="font-semibold mt-1" style={{ color: 'var(--primary)' }}>${item.product.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50 text-sm">-</button>
                    <span className="px-3 py-1 text-sm">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-50 text-sm">+</button>
                  </div>
                  <p className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.id)} className="ml-auto text-gray-400 hover:text-red-500"><X size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-5 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span style={{ color: 'var(--primary)' }}>${subtotal.toFixed(2)}</span></div>
            </div>
            <Link href="/checkout" className="btn-primary w-full block text-center">Proceed to Checkout</Link>
            <Link href="/products" className="btn-secondary w-full block text-center mt-2 text-sm">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
