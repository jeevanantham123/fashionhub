'use client';

import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { wishlistApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  onWishlistToggle?: () => void;
  inWishlist?: boolean;
}

export function ProductCard({ product, onWishlistToggle, inWishlist }: Props) {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    const variant = product.variants?.[0];
    try {
      await addItem(product.id, variant?.id);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    try {
      if (inWishlist) {
        await wishlistApi.remove(product.id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.add(product.id);
        toast.success('Added to wishlist!');
      }
      onWishlistToggle?.();
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const rating = product.avgRating || 0;
  const discountPct = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">👗</div>
          )}
          {discountPct > 0 && (
            <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary)' }}>-{discountPct}%</span>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded bg-gray-900">Featured</span>
          )}
          <button onClick={handleWishlist} className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow hover:scale-110 transition-transform ${inWishlist ? 'text-red-500' : 'text-gray-400'}`}>
            <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleAddToCart} className="btn-primary w-full text-sm py-2">Quick Add</button>
          </div>
        </div>
        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
          <h3 className="font-medium text-sm line-clamp-1 mb-1">{product.name}</h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={11} fill={i <= Math.round(rating) ? 'var(--primary)' : 'none'} stroke={i <= Math.round(rating) ? 'var(--primary)' : '#d1d5db'} />
              ))}
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: 'var(--primary)' }}>${product.price.toFixed(2)}</span>
            {product.comparePrice && <span className="text-xs text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
