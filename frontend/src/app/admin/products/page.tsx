'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetch = async () => {
    setIsLoading(true);
    const { data } = await productApi.list({ page, limit: 20, search, active: 'all' });
    setProducts(data.products);
    setTotal(data.total);
    setIsLoading(false);
  };

  useEffect(() => { fetch(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    await productApi.delete(id);
    toast.success('Product deactivated');
    fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Products ({total})</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Product</Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="pl-9 input" />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{['Product', 'Category', 'Price', 'Variants', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover rounded" />}
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      {p.featured && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent)', color: 'var(--secondary)' }}>Featured</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{(p as any).category?.name}</td>
                <td className="px-4 py-3 text-sm font-semibold">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.variants?.length || 0}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${p.id}`} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><Edit size={15} /></Link>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded" title="Deactivate"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isLoading && <p className="text-center text-gray-400 text-sm py-4">Loading...</p>}
    </div>
  );
}
