'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Tag, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { authApi, couponApi, orderApi } from '@/lib/api';
import { Address, Coupon } from '@/types';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Coupon', 'Review', 'Confirm'];

export function CheckoutPage() {
  const { cart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'US' });
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/checkout'); return; }
    authApi.addresses().then(({ data }) => {
      setAddresses(data);
      const def = data.find((a: Address) => a.isDefault);
      if (def) setSelectedAddress(def.id);
    });
    fetchCart();
  }, [user]);

  const subtotal = cart?.items.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0;
  const discount = appliedCoupon?.type === 'PERCENT' ? subtotal * (appliedCoupon.value / 100) : appliedCoupon?.value || 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await couponApi.validate(couponCode, subtotal);
      setAppliedCoupon(data);
      toast.success(`Coupon applied! -$${data.discount.toFixed(2)}`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Invalid coupon');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await authApi.addAddress(newAddress);
      setAddresses(prev => [...prev, data]);
      setSelectedAddress(data.id);
      setShowNewAddress(false);
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const handlePlaceOrder = async () => {
    if (!cart?.items.length) return;
    setIsPlacing(true);
    try {
      const items = cart.items.map(i => ({ productId: i.productId, variantId: i.variantId || null, quantity: i.quantity }));
      const { data } = await orderApi.create({ shippingAddressId: selectedAddress || null, couponCode: appliedCoupon?.code, items });
      setOrderId(data.id);
      setStep(3);
      await fetchCart();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to place order');
    }
    setIsPlacing(false);
  };

  if (!cart?.items.length && step < 3) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
        <h1 className="text-2xl font-heading font-bold mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Your order <span className="font-mono font-medium">{orderId.slice(0, 8)}...</span> has been placed successfully.</p>
        <p className="text-gray-400 text-sm mb-6">You'll receive a confirmation email shortly.</p>
        <div className="flex gap-3 justify-center">
          <Link href={`/orders/${orderId}`} className="btn-primary">View Order</Link>
          <Link href="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-heading font-bold mb-6">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        {STEPS.slice(0, 3).map((s, i) => (
          <div key={s} className="flex items-center">
            <button onClick={() => i < step && setStep(i)} className={`flex items-center gap-2 text-sm ${i <= step ? 'font-medium' : 'text-gray-400'}`}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={i <= step ? { backgroundColor: 'var(--primary)', color: 'white' } : { backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < 2 && <ChevronRight size={16} className="mx-2 text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel */}
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin size={18} /> Shipping Address</h2>
              {addresses.map(addr => (
                <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${selectedAddress === addr.id ? '' : ''}`} style={selectedAddress === addr.id ? { borderColor: 'var(--primary)', backgroundColor: 'var(--accent)20' } : {}}>
                  <input type="radio" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                  <div>
                    <p className="font-medium text-sm">{addr.label}</p>
                    <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                </label>
              ))}
              <button onClick={() => setShowNewAddress(!showNewAddress)} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>+ Add new address</button>
              {showNewAddress && (
                <form onSubmit={handleAddAddress} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={newAddress.label} onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))} placeholder="Label (Home/Work)" className="input" />
                    <input value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))} placeholder="Street address" required className="input" />
                    <input value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} placeholder="City" required className="input" />
                    <input value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} placeholder="State" required className="input" />
                    <input value={newAddress.zip} onChange={e => setNewAddress(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP code" required className="input" />
                    <input value={newAddress.country} onChange={e => setNewAddress(p => ({ ...p, country: e.target.value }))} placeholder="Country" required className="input" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-sm px-4 py-2">Save Address</button>
                    <button type="button" onClick={() => setShowNewAddress(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                  </div>
                </form>
              )}
              <button onClick={() => setStep(1)} className="btn-primary w-full mt-4">Continue to Coupon</button>
            </div>
          )}

          {/* Step 1: Coupon */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Tag size={18} /> Discount Code</h2>
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="input flex-1" />
                <button onClick={handleApplyCoupon} className="btn-primary px-6 whitespace-nowrap">Apply</button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <CheckCircle size={16} />
                  <span>Code <strong>{appliedCoupon.code}</strong> applied — saved ${discount.toFixed(2)}</span>
                  <button onClick={() => setAppliedCoupon(null)} className="ml-auto text-green-500">✕</button>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard size={18} /> Review Order</h2>
              <div className="space-y-3">
                {cart?.items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant.size} / {item.variant.color}</p>}
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={handlePlaceOrder} disabled={isPlacing} className="btn-primary flex-1 disabled:opacity-50">
                  {isPlacing ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {appliedCoupon && <div className="flex justify-between text-green-600"><span>Discount ({appliedCoupon.code})</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
