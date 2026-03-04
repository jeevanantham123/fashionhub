'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi, categoryApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { ProductCard } from './product/ProductCard';
import { Filter, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '6', '7', '8', '9', '10', '11', 'One Size'];
const COLORS = ['White', 'Black', 'Blue', 'Navy', 'Camel', 'Ivory', 'Nude', 'Light Blue', 'Floral Pink', 'Floral Blue', 'Tan', 'Multicolor'];
const SORTS = [
  { value: 'createdAt_desc', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Top Rated' },
];

export function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'createdAt_desc';
  const page = parseInt(searchParams.get('page') || '1');
  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await productApi.list({ category, search, sort, page, size: selectedSize, color: selectedColor, minPrice, maxPrice, limit: 12 });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setIsLoading(false);
  }, [category, search, sort, page, selectedSize, selectedColor, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoryApi.list().then(({ data }) => setCategories(data.filter((c: Category) => !c.parentId))); }, []);

  const activeFilters = [
    category && { key: 'category', value: category, label: category },
    selectedSize && { key: 'size', value: selectedSize, label: `Size: ${selectedSize}` },
    selectedColor && { key: 'color', value: selectedColor, label: `Color: ${selectedColor}` },
    minPrice && { key: 'minPrice', value: minPrice, label: `Min: $${minPrice}` },
    maxPrice && { key: 'maxPrice', value: maxPrice, label: `Max: $${maxPrice}` },
  ].filter(Boolean) as { key: string; value: string; label: string }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : search ? `Search: "${search}"` : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 px-4 py-2 border rounded text-sm hover:bg-gray-50 md:hidden">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="px-3 py-2 border rounded text-sm focus:outline-none">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map(f => (
            <button key={f.key} onClick={() => updateParam(f.key, '')} className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200">
              {f.label} <X size={12} />
            </button>
          ))}
          <button onClick={() => router.push('/products')} className="text-xs text-red-500 hover:underline">Clear all</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
          <div className="space-y-6 sticky top-24">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Category</h3>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => updateParam('category', '')} className={`text-sm w-full text-left py-1 hover:opacity-70 ${!category ? 'font-semibold' : ''}`}>All</button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button onClick={() => updateParam('category', cat.slug)} className={`text-sm w-full text-left py-1 hover:opacity-70 ${category === cat.slug ? 'font-semibold' : ''}`} style={category === cat.slug ? { color: 'var(--primary)' } : {}}>
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Price Range</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => updateParam('minPrice', e.target.value)} className="w-full px-2 py-1 border rounded text-sm focus:outline-none" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => updateParam('maxPrice', e.target.value)} className="w-full px-2 py-1 border rounded text-sm focus:outline-none" />
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Size</h3>
              <div className="flex flex-wrap gap-1">
                {SIZES.map(s => (
                  <button key={s} onClick={() => updateParam('size', selectedSize === s ? '' : s)} className={`px-2 py-1 text-xs border rounded transition-colors ${selectedSize === s ? 'text-white' : 'hover:border-gray-400'}`} style={selectedSize === s ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Color</h3>
              <div className="flex flex-wrap gap-1">
                {COLORS.map(c => (
                  <button key={c} onClick={() => updateParam('color', selectedColor === c ? '' : c)} className={`px-2 py-1 text-xs border rounded transition-colors ${selectedColor === c ? 'text-white' : 'hover:border-gray-400'}`} style={selectedColor === c ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">No products found</p>
              <button onClick={() => router.push('/products')} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} onClick={() => updateParam('page', String(i + 1))} className={`w-9 h-9 rounded text-sm ${page === i + 1 ? 'text-white' : 'border hover:bg-gray-50'}`} style={page === i + 1 ? { backgroundColor: 'var(--primary)' } : {}}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
