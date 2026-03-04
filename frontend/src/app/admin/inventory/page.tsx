'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { AlertTriangle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [variants, setVariants] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  useEffect(() => { adminApi.inventory().then(({ data }) => setVariants(data)); }, []);

  const handleSave = async (id: string) => {
    await adminApi.updateStock(id, parseInt(editStock));
    setVariants(v => v.map(variant => variant.id === id ? { ...variant, stock: parseInt(editStock) } : variant));
    setEditingId(null);
    toast.success('Stock updated');
  };

  const displayed = filter === 'low' ? variants.filter(v => v.stock <= 5) : variants;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Inventory</h1>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm rounded border ${filter === 'all' ? 'text-white' : ''}`} style={filter === 'all' ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>All Variants</button>
          <button onClick={() => setFilter('low')} className={`px-4 py-2 text-sm rounded border flex items-center gap-1 ${filter === 'low' ? 'text-white' : ''}`} style={filter === 'low' ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
            <AlertTriangle size={14} /> Low Stock ({variants.filter(v => v.stock <= 5).length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{['Product', 'Size', 'Color', 'SKU', 'Stock', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map(v => (
              <tr key={v.id} className={`hover:bg-gray-50 ${v.stock <= 5 ? 'bg-orange-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {v.product?.images?.[0] && <img src={v.product.images[0]} alt="" className="w-8 h-10 object-cover rounded" />}
                    <span className="text-sm font-medium">{v.product?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{v.size}</td>
                <td className="px-4 py-3 text-sm">{v.color}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-400">{v.sku || '—'}</td>
                <td className="px-4 py-3">
                  {editingId === v.id ? (
                    <input autoFocus type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-20 px-2 py-1 border rounded text-sm" onKeyDown={e => e.key === 'Enter' && handleSave(v.id)} />
                  ) : (
                    <span className={`font-semibold ${v.stock === 0 ? 'text-red-500' : v.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                      {v.stock === 0 ? 'Out of Stock' : v.stock}
                      {v.stock > 0 && v.stock <= 5 && <AlertTriangle size={12} className="inline ml-1 text-orange-500" />}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === v.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleSave(v.id)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"><Check size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 text-xs">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(v.id); setEditStock(String(v.stock)); }} className="text-xs border rounded px-3 py-1 hover:bg-gray-50">Edit Stock</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
