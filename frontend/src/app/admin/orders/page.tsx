'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetch = async () => {
    const { data } = await adminApi.orders({ page, limit: 20, status: status || undefined, search: search || undefined });
    setOrders(data.orders);
    setTotal(data.total);
  };

  useEffect(() => { fetch(); }, [page, status, search]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await adminApi.updateOrderStatus(id, newStatus);
    toast.success('Status updated');
    fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Orders ({total})</h1>
      </div>
      <div className="flex gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="pl-9 input" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input w-48">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">
                  <Link href={`/admin/orders/${order.id}`} className="hover:underline" style={{ color: 'var(--primary)' }}>#{order.id.slice(0, 8)}</Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium">{order.user?.name}</p>
                  <p className="text-xs text-gray-400">{order.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">{order.items.reduce((s: number, i: any) => s + i.quantity, 0)}</td>
                <td className="px-4 py-3 text-sm font-semibold">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select value={order.status} onChange={e => handleStatusUpdate(order.id, e.target.value)} className="text-xs border rounded px-2 py-1 focus:outline-none">
                    {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
