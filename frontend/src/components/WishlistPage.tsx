'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import { WishlistItem } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { ProductCard } from './product/ProductCard';

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  const fetchWishlist = async () => {
    const { data } = await wishlistApi.get();
    setItems(data.items || []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchWishlist();
  }, [user]);

  const handleToggle = () => fetchWishlist();

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary) transparent transparent transparent' }} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-heading font-bold mb-6">My Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <Link href="/products" className="btn-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <ProductCard key={item.id} product={item.product} inWishlist onWishlistToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
