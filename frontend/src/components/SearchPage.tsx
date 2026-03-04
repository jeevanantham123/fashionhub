'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from './product/ProductCard';
import { Search } from 'lucide-react';

export function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setIsLoading(true);
    productApi.list({ search: q, limit: 24 }).then(({ data }) => {
      setProducts(data.products);
      setTotal(data.total);
    }).finally(() => setIsLoading(false));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Search size={20} className="text-gray-400" />
        <div>
          <h1 className="text-2xl font-heading font-bold">{q ? `Results for "${q}"` : 'Search'}</h1>
          {q && <p className="text-sm text-gray-500">{total} products found</p>}
        </div>
      </div>
      {!q ? (
        <p className="text-gray-500">Enter a search term to find products.</p>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No products found for "{q}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
