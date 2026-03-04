'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi, homeSectionApi, categoryApi } from '@/lib/api';
import { HomeSection, Product, Category } from '@/types';
import { ProductCard } from './product/ProductCard';
import { ArrowRight, Mail } from 'lucide-react';

export function HomePage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    homeSectionApi.list().then(({ data }) => setSections(data.filter((s: HomeSection) => s.visible)));
    productApi.list({ featured: 'true', limit: 8 }).then(({ data }) => setFeaturedProducts(data.products));
    categoryApi.list().then(({ data }) => setCategories(data.filter((c: Category) => !c.parentId).slice(0, 6)));
  }, []);

  const renderSection = (section: HomeSection) => {
    switch (section.type) {
      case 'hero': return <HeroSection key={section.id} section={section} />;
      case 'featured': return <FeaturedSection key={section.id} section={section} products={featuredProducts} />;
      case 'categories': return <CategoriesSection key={section.id} section={section} categories={categories} />;
      case 'promo': return <PromoSection key={section.id} section={section} />;
      case 'newsletter': return <NewsletterSection key={section.id} section={section} email={email} setEmail={setEmail} />;
      default: return null;
    }
  };

  return <div>{sections.map(renderSection)}</div>;
}

function HeroSection({ section }: { section: HomeSection }) {
  return (
    <div className="relative min-h-[70vh] flex items-center" style={{ backgroundImage: `url(${section.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">{section.title}</h1>
          <p className="text-lg text-gray-200 mb-8">{section.subtitle}</p>
          {section.buttonText && (
            <Link href={section.buttonLink || '/products'} className="inline-flex items-center gap-2 px-8 py-4 text-white font-medium rounded transition-all" style={{ backgroundColor: 'var(--primary)' }}>
              {section.buttonText} <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedSection({ section, products }: { section: HomeSection; products: Product[] }) {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold">{section.title}</h2>
          {section.subtitle && <p className="text-gray-500 mt-1">{section.subtitle}</p>}
        </div>
        {section.buttonText && (
          <Link href={section.buttonLink || '/products'} className="flex items-center gap-1 text-sm font-medium hover:opacity-70" style={{ color: 'var(--primary)' }}>
            {section.buttonText} <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function CategoriesSection({ section, categories }: { section: HomeSection; categories: Category[] }) {
  const categoryImages: Record<string, string> = {
    tops: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    bottoms: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    dresses: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
    outerwear: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold">{section.title}</h2>
          {section.subtitle && <p className="text-gray-500 mt-1">{section.subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group text-center">
              <div className="aspect-square rounded-full overflow-hidden mb-3 mx-auto w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-md group-hover:shadow-lg transition-shadow">
                <img src={cat.image || categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="text-sm font-medium">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoSection({ section }: { section: HomeSection }) {
  const bgColor = section.content?.backgroundColor || 'var(--secondary)';
  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-white">
          <h2 className="text-4xl font-heading font-bold mb-3">{section.title}</h2>
          <p className="text-gray-300 text-lg mb-6">{section.subtitle}</p>
          {section.buttonText && (
            <Link href={section.buttonLink || '/products'} className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded text-white border border-white hover:bg-white/10 transition-colors">
              {section.buttonText} <ArrowRight size={16} />
            </Link>
          )}
        </div>
        {section.imageUrl && (
          <div className="flex-1">
            <img src={section.imageUrl} alt={section.title} className="rounded-lg w-full max-h-80 object-cover shadow-2xl" />
          </div>
        )}
      </div>
    </section>
  );
}

function NewsletterSection({ section, email, setEmail }: { section: HomeSection; email: string; setEmail: (v: string) => void }) {
  const placeholder = section.content?.placeholder || 'Enter your email';
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    alert('Thanks for subscribing!');
  };
  return (
    <section className="py-16 border-t border-gray-100">
      <div className="max-w-xl mx-auto text-center px-4">
        <Mail size={36} className="mx-auto mb-4" style={{ color: 'var(--primary)' }} />
        <h2 className="text-3xl font-heading font-bold mb-2">{section.title}</h2>
        <p className="text-gray-500 mb-6">{section.subtitle}</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={placeholder} required className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'var(--primary)' } as any} />
          <button type="submit" className="btn-primary px-6 py-3 whitespace-nowrap">{section.buttonText || 'Subscribe'}</button>
        </form>
      </div>
    </section>
  );
}
