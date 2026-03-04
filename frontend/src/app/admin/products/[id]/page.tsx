'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, categoryApi, uploadApi } from '@/lib/api';
import { Category } from '@/types';
import { Plus, Trash2, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface Variant { size: string; color: string; stock: number; sku: string; }

export default function AdminProductForm({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new';
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', comparePrice: '', categoryId: '', tags: '', featured: false, active: true, images: [] as string[] });
  const [variants, setVariants] = useState<Variant[]>([{ size: 'S', color: 'Black', stock: 10, sku: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.filter((c: Category) => !c.parentId)));
    if (!isNew) {
      productApi.list({ active: 'all' }).then(({ data }) => {
        // Actually fetch by id via a workaround — find in list or use slug
      });
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.upload(files);
      setForm(f => ({ ...f, images: [...f.images, ...data.urls] }));
      toast.success('Images uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Select a category'); return; }
    setIsLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) || 0, comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), variants };
      if (isNew) await productApi.create(payload);
      else await productApi.update(params.id, payload);
      toast.success(isNew ? 'Product created!' : 'Product updated!');
      router.push('/admin/products');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    setIsLoading(false);
  };

  const addVariant = () => setVariants(v => [...v, { size: 'M', color: 'White', stock: 0, sku: '' }]);
  const removeVariant = (i: number) => setVariants(v => v.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof Variant, value: any) => setVariants(v => v.map((variant, idx) => idx === i ? { ...variant, [field]: value } : variant));

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-heading font-bold">{isNew ? 'New Product' : 'Edit Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="input resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare-at Price</label>
              <input type="number" step="0.01" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="casual, cotton, summer" className="input" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded" />
              Featured product
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
              Active
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold">Images</h2>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border-2 border-dashed rounded-lg text-sm text-gray-500 hover:border-gray-400 w-fit">
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Images'}
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          <div className="text-xs text-gray-400">Or enter image URLs below (one per line)</div>
          <textarea value={form.images.join('\n')} onChange={e => setForm(f => ({ ...f, images: e.target.value.split('\n').filter(Boolean) }))} rows={3} placeholder="https://images.unsplash.com/..." className="input resize-none text-sm" />
          {form.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Variants</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm" style={{ color: 'var(--primary)' }}><Plus size={14} /> Add Variant</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase">
                <tr>{['Size', 'Color', 'Stock', 'SKU', ''].map(h => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((v, i) => (
                  <tr key={i}>
                    <td className="py-2 px-1"><input value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} className="w-20 px-2 py-1 border rounded text-sm" /></td>
                    <td className="py-2 px-1"><input value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} className="w-24 px-2 py-1 border rounded text-sm" /></td>
                    <td className="py-2 px-1"><input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} className="w-20 px-2 py-1 border rounded text-sm" /></td>
                    <td className="py-2 px-1"><input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="SKU" className="w-28 px-2 py-1 border rounded text-sm" /></td>
                    <td className="py-2 px-1"><button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Product'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
