'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, ChevronRight } from 'lucide-react';
import { productApi, reviewApi, wishlistApi } from '@/lib/api';
import { Product, ProductVariant, Review } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ProductCard } from './product/ProductCard';
import toast from 'react-hot-toast';

export function ProductDetailPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    productApi.get(slug).then(({ data }) => {
      setProduct(data);
      if (data.variants?.length) setSelectedVariant(data.variants[0]);
      setIsLoading(false);
    }).catch(() => router.push('/products'));
  }, [slug]);

  useEffect(() => {
    if (user && product) {
      wishlistApi.get().then(({ data }) => {
        setInWishlist(data.items.some((i: any) => i.productId === product.id));
      }).catch(() => {});
    }
  }, [user, product]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary) transparent transparent transparent' }} /></div>;
  if (!product) return null;

  const sizes = Array.from(new Set(product.variants.map(v => v.size)));
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const selectedSize = selectedVariant?.size;
  const selectedColor = selectedVariant?.color;
  const avgRating = product.reviews?.length ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length : 0;
  const stock = selectedVariant?.stock || 0;

  const pickVariant = (size?: string, color?: string) => {
    const s = size ?? selectedSize;
    const c = color ?? selectedColor;
    const v = product.variants.find(v => v.size === s && v.color === c) || product.variants.find(v => v.size === s) || product.variants[0];
    setSelectedVariant(v || null);
  };

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, selectedVariant?.id, quantity);
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleWishlist = async () => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      if (inWishlist) { await wishlistApi.remove(product.id); setInWishlist(false); toast.success('Removed from wishlist'); }
      else { await wishlistApi.add(product.id); setInWishlist(true); toast.success('Added to wishlist!'); }
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    try {
      const { data } = await reviewApi.create(product.id, review);
      setProduct(prev => prev ? { ...prev, reviews: [data, ...(prev.reviews || []).filter(r => r.userId !== user.id)] } : prev);
      toast.success('Review submitted!');
    } catch { toast.error('Failed to submit review'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:opacity-70">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:opacity-70">Products</Link>
        <ChevronRight size={14} />
        {product.category && <Link href={`/products?category=${product.category.slug}`} className="hover:opacity-70">{product.category.name}</Link>}
        <ChevronRight size={14} />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
            {product.images[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full flex items-center justify-center text-6xl">👗</div>}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${selectedImage === i ? '' : 'border-transparent'}`} style={selectedImage === i ? { borderColor: 'var(--primary)' } : {}}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{product.category?.name}</p>
          <h1 className="text-3xl font-heading font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= Math.round(avgRating) ? 'var(--primary)' : 'none'} stroke={i <= Math.round(avgRating) ? 'var(--primary)' : '#d1d5db'} />)}</div>
              <span className="text-sm text-gray-500">({product.reviews?.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>${product.price.toFixed(2)}</span>
            {product.comparePrice && <span className="text-lg text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>}
            {product.comparePrice && <span className="text-sm font-medium text-green-600">Save {Math.round((1 - product.price/product.comparePrice)*100)}%</span>}
          </div>

          {/* Size picker */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Size: <span className="font-semibold">{selectedSize}</span></p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s} onClick={() => pickVariant(s)} className={`px-3 py-1.5 text-sm border rounded transition-colors ${selectedSize === s ? 'text-white' : 'hover:border-gray-400'}`} style={selectedSize === s ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color picker */}
          {colors.length > 1 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Color: <span className="font-semibold">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button key={c} onClick={() => pickVariant(undefined, c)} className={`px-3 py-1.5 text-sm border rounded transition-colors ${selectedColor === c ? 'text-white' : 'hover:border-gray-400'}`} style={selectedColor === c ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock status */}
          <p className={`text-sm mb-4 ${stock > 5 ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
            {stock > 5 ? `In Stock (${stock} available)` : stock > 0 ? `Only ${stock} left!` : 'Out of Stock'}
          </p>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border rounded">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50">-</button>
              <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-50">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={stock === 0} className="flex-1 flex items-center justify-center gap-2 py-3 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--primary)' }}>
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button onClick={handleWishlist} className={`p-3 border rounded transition-colors ${inWishlist ? 'text-red-500 border-red-200' : 'hover:bg-gray-50'}`}>
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-6">
              {product.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 rounded">{tag}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex border-b mb-6">
          {['description', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${activeTab === tab ? '' : 'border-transparent text-gray-500 hover:text-gray-700'}`} style={activeTab === tab ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}>
              {tab} {tab === 'reviews' && product.reviews?.length ? `(${product.reviews.length})` : ''}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-600 leading-relaxed">
            <p>{product.description || 'No description available.'}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6 max-w-2xl">
            {user && (
              <form onSubmit={handleReview} className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Write a Review</h3>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button" onClick={() => setReview(r => ({ ...r, rating: i }))}>
                      <Star size={24} fill={i <= review.rating ? 'var(--primary)' : 'none'} stroke={i <= review.rating ? 'var(--primary)' : '#d1d5db'} />
                    </button>
                  ))}
                </div>
                <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} placeholder="Share your experience..." className="w-full p-3 border rounded text-sm focus:outline-none h-24 resize-none" />
                <button type="submit" className="btn-primary px-6 py-2 text-sm">Submit Review</button>
              </form>
            )}
            {product.reviews?.map(r => (
              <div key={r.id} className="border-b pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.user?.name}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex mb-2">{[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= r.rating ? 'var(--primary)' : 'none'} stroke={i <= r.rating ? 'var(--primary)' : '#d1d5db'} />)}</div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
            {!product.reviews?.length && <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>}
          </div>
        )}
      </div>

      {/* Related */}
      {product.related && product.related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
