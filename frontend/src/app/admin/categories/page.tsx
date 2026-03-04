'use client';

import { useEffect, useState } from 'react';
import { categoryApi } from '@/lib/api';
import { Category } from '@/types';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '', parentId: '' });

  const fetchCategories = () => categoryApi.list().then(({ data }) => setCategories(data));
  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryApi.update(editingId, form);
        toast.success('Category updated!');
        setEditingId(null);
      } else {
        await categoryApi.create(form);
        toast.success('Category created!');
        setShowForm(false);
      }
      setForm({ name: '', slug: '', image: '', parentId: '' });
      fetchCategories();
    } catch { toast.error('Failed to save category'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in this category may be affected.')) return;
    try {
      await categoryApi.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Cannot delete category with products'); }
  };

  const startEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || '', parentId: cat.parentId || '' });
    setEditingId(cat.id);
    setShowForm(false);
  };

  const rootCats = categories.filter(c => !c.parentId);

  const FormFields = () => (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg mb-4">
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="Category name" required className="input" />
      <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="slug" className="input" />
      <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL (optional)" className="input" />
      <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))} className="input">
        <option value="">No parent (top-level)</option>
        {rootCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="flex gap-2 col-span-2">
        <button type="submit" className="btn-primary flex items-center gap-1 text-sm px-4 py-2"><Check size={14} /> Save</button>
        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: '', slug: '', image: '', parentId: '' }); }} className="btn-secondary flex items-center gap-1 text-sm px-4 py-2"><X size={14} /> Cancel</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Categories</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Category</button>
      </div>

      {showForm && !editingId && <FormFields />}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>{['Name', 'Slug', 'Products', 'Parent', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <>
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.image && <img src={cat.image} alt={cat.name} className="w-8 h-8 object-cover rounded-full" />}
                      <span className="font-medium text-sm">{!cat.parentId ? '' : '↳ '}{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{cat._count?.products || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{cat.parentId ? categories.find(c => c.id === cat.parentId)?.name : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
                {editingId === cat.id && (
                  <tr key={`${cat.id}-edit`}><td colSpan={5} className="px-4 py-2"><FormFields /></td></tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
