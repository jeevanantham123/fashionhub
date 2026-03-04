'use client';

import { useEffect, useState } from 'react';
import { couponApi } from '@/lib/api';
import { Coupon } from '@/types';
import { Plus, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { code: '', type: 'PERCENT', value: '', minOrder: '0', maxUses: '', expiresAt: '', active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);

  const fetch = () => couponApi.list().then(({ data }) => setCoupons(data));
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponApi.create(form);
      toast.success('Coupon created!');
      setForm(emptyForm);
      setShowForm(false);
      fetch();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    await couponApi.delete(id);
    toast.success('Coupon deleted');
    fetch();
  };

  const toggleActive = async (coupon: Coupon) => {
    await couponApi.update(coupon.id, { active: !coupon.active });
    fetch();
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Coupon</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold">Create Coupon</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm((f: any) => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="SAVE10" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))} className="input">
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <input type="number" step="0.01" value={form.value} onChange={e => setForm((f: any) => ({ ...f, value: e.target.value }))} required placeholder={form.type === 'PERCENT' ? '10' : '20'} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order ($)</label>
              <input type="number" step="0.01" value={form.minOrder} onChange={e => setForm((f: any) => ({ ...f, minOrder: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm((f: any) => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm((f: any) => ({ ...f, expiresAt: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex items-center gap-1 text-sm"><Check size={14} /> Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex items-center gap-1 text-sm"><X size={14} /> Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{['Code', 'Type', 'Value', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm font-semibold">{c.code}</td>
                <td className="px-4 py-3 text-sm">{c.type}</td>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--primary)' }}>{c.type === 'PERCENT' ? `${c.value}%` : `$${c.value}`}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.minOrder > 0 ? `$${c.minOrder}` : 'None'}</td>
                <td className="px-4 py-3 text-sm">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c)} className={`px-2 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.active ? 'Active' : 'Inactive'}</button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
