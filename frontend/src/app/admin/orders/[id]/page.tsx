'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminOrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const router = useRouter();

  useEffect(() => { adminApi.getOrder(params.id).then(({ data }) => setOrder(data)); }, [params.id]);

  const handleStatus = async (status: string) => {
    await adminApi.updateOrderStatus(params.id, status);
    setOrder((o: any) => ({ ...o, status }));
    toast.success('Status updated');
  };

  if (!order) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary) transparent transparent transparent' }} /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-heading font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
        <span className="text-sm font-medium">Update Status:</span>
        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => handleStatus(s)} className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${order.status === s ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100'} ${STATUS_COLORS[s]}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-3">Items</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-3">
                  {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-14 h-16 object-cover rounded" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product?.name}</p>
                    {item.variant && <p className="text-xs text-gray-500">{item.variant.size} / {item.variant.color}</p>}
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-2">Customer</h2>
            <p className="text-sm font-medium">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
          </div>
          {order.shippingAddress && (
            <div className="bg-white rounded-lg border p-4">
              <h2 className="font-semibold mb-2">Shipping Address</h2>
              <p className="text-sm">{order.shippingAddress.street}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            </div>
          )}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold mb-3">Summary</h2>
            <div className="space-y-1 text-sm">
              {order.coupon && <div className="flex justify-between text-green-600"><span>Coupon ({order.coupon.code})</span><span>-</span></div>}
              <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span style={{ color: 'var(--primary)' }}>${order.total.toFixed(2)}</span></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
