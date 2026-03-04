'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { Order } from '@/types';

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderApi.get(orderId).then(({ data }) => setOrder(data)).finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary) transparent transparent transparent' }} /></div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const statusIdx = STATUS_STEPS.indexOf(order.status);
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = order.coupon ? (order.coupon.type === 'PERCENT' ? subtotal * (order.coupon.value / 100) : order.coupon.value) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/orders" className="hover:opacity-70">Orders</Link>
        <ChevronRight size={14} />
        <span>#{order.id.slice(0, 8).toUpperCase()}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
      </div>

      {/* Status tracker */}
      {order.status !== 'CANCELLED' && (
        <div className="flex items-center mb-8 overflow-x-auto">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= statusIdx ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={i <= statusIdx ? { backgroundColor: 'var(--primary)' } : {}}>
                  {i < statusIdx ? '✓' : i + 1}
                </div>
                <p className="text-xs mt-1 whitespace-nowrap">{s}</p>
              </div>
              {i < STATUS_STEPS.length - 1 && <div className={`h-0.5 w-12 mx-1 ${i < statusIdx ? '' : 'bg-gray-200'}`} style={i < statusIdx ? { backgroundColor: 'var(--primary)' } : {}} />}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-semibold">Items</h2>
          {order.items.map(item => (
            <div key={item.id} className="flex gap-3 border rounded-lg p-3">
              {item.product?.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-20 object-cover rounded" />}
              <div className="flex-1">
                <Link href={`/products/${item.product?.slug}`} className="text-sm font-medium hover:underline">{item.product?.name}</Link>
                {item.variant && <p className="text-xs text-gray-500">{item.variant.size} / {item.variant.color}</p>}
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {order.coupon && <div className="flex justify-between text-green-600"><span>Coupon ({order.coupon.code})</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold pt-2 border-t"><span>Total</span><span style={{ color: 'var(--primary)' }}>${order.total.toFixed(2)}</span></div>
            </div>
          </div>
          {order.shippingAddress && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Shipping To</h3>
              <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            </div>
          )}
          <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
