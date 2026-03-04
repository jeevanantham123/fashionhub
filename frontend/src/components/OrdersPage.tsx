'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { Order } from '@/types';
import { useAuthStore } from '@/store/authStore';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    orderApi.list().then(({ data }) => setOrders(data)).finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary) transparent transparent transparent' }} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-heading font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  <p className="font-bold mt-1" style={{ color: 'var(--primary)' }}>${order.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {order.items.slice(0, 4).map(item => (
                  <img key={item.id} src={item.product?.images?.[0]} alt={item.product?.name} className="w-12 h-14 object-cover rounded" />
                ))}
                {order.items.length > 4 && <div className="w-12 h-14 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">+{order.items.length - 4}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
