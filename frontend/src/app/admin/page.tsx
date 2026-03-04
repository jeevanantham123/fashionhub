'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { TrendingUp, ShoppingBag, Users, AlertTriangle, DollarSign } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { adminApi.stats().then(({ data }) => setStats(data)); }, []);

  if (!stats) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary) transparent transparent transparent' }} /></div>;

  const kpis = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Customers', value: stats.totalUsers, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
  ];

  // Build chart data from dailyRevenue
  const chartData = Object.entries(stats.dailyRevenue || {}).slice(-14).sort(([a], [b]) => a.localeCompare(b));
  const maxRevenue = Math.max(...chartData.map(([, v]) => v as number), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-lg p-5 border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.color}`}><kpi.icon size={18} /></div>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-5 border">
          <h2 className="font-semibold mb-4">Revenue (Last 14 Days)</h2>
          <div className="flex items-end gap-1 h-36">
            {chartData.map(([date, revenue]) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t transition-all" style={{ height: `${((revenue as number) / maxRevenue) * 128}px`, backgroundColor: 'var(--primary)', minHeight: '2px' }} title={`$${(revenue as number).toFixed(2)}`} />
                <span className="text-xs text-gray-400 writing-mode-vertical">{date.slice(5)}</span>
              </div>
            ))}
            {chartData.length === 0 && <p className="text-gray-400 text-sm">No revenue data</p>}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-lg p-5 border">
          <h2 className="font-semibold mb-4">Top Products</h2>
          <div className="space-y-3">
            {stats.topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-5">{i + 1}</span>
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.soldCount} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm" style={{ color: 'var(--primary)' }}>View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline" style={{ color: 'var(--primary)' }}>#{order.id.slice(0, 8)}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{order.user?.name}</td>
                  <td className="px-4 py-3 text-sm">{order.items.reduce((s: number, i: any) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
