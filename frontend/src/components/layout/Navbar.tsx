'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { productApi } from '@/lib/api';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { cart, openCart } = useCartStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const itemCount = cart?.items.reduce((a, i) => a + i.quantity, 0) || 0;
  const logoText = theme?.['logo-text'] || 'FashionHub';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSuggestions([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await productApi.suggest(query);
        setSuggestions(data);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-heading font-bold" style={{ color: 'var(--primary)' }}>
            {logoText}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm font-medium hover:opacity-70 transition-opacity">Shop All</Link>
            <Link href="/products?category=tops" className="text-sm font-medium hover:opacity-70 transition-opacity">Tops</Link>
            <Link href="/products?category=bottoms" className="text-sm font-medium hover:opacity-70 transition-opacity">Bottoms</Link>
            <Link href="/products?category=dresses" className="text-sm font-medium hover:opacity-70 transition-opacity">Dresses</Link>
            <Link href="/products?category=outerwear" className="text-sm font-medium hover:opacity-70 transition-opacity">Outerwear</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:opacity-70 transition-opacity">
                <Search size={20} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-100 z-50">
                  <form onSubmit={handleSearch} className="flex items-center p-3 border-b">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." className="flex-1 outline-none text-sm" />
                    {query && <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }}><X size={14} className="text-gray-400" /></button>}
                  </form>
                  {suggestions.length > 0 && (
                    <ul className="py-1 max-h-60 overflow-y-auto">
                      {suggestions.map(s => (
                        <li key={s.id}>
                          <Link href={`/products/${s.slug}`} onClick={() => { setSearchOpen(false); setQuery(''); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                            {s.images?.[0] && <img src={s.images[0]} alt={s.name} className="w-8 h-8 object-cover rounded" />}
                            <span className="flex-1">{s.name}</span>
                            <span className="text-gray-500">${s.price}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            {user && (
              <Link href="/wishlist" className="p-2 hover:opacity-70 transition-opacity">
                <Heart size={20} />
              </Link>
            )}

            {/* Cart */}
            <button onClick={openCart} className="p-2 hover:opacity-70 transition-opacity relative">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--primary)' }}>
                  {itemCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 hover:opacity-70 transition-opacity flex items-center gap-1">
                  <User size={20} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-100 py-1 z-50">
                    <p className="px-4 py-2 text-sm text-gray-500 border-b">{user.name}</p>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <User size={14} /> Profile
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <ShoppingBag size={14} /> Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        <LayoutDashboard size={14} /> Admin
                      </Link>
                    )}
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-red-500">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:flex items-center gap-1 text-sm font-medium px-4 py-2 rounded" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                Sign In
              </Link>
            )}

            {/* Mobile menu */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {['Shop All:/products', 'Tops:/products?category=tops', 'Bottoms:/products?category=bottoms', 'Dresses:/products?category=dresses', 'Outerwear:/products?category=outerwear'].map(item => {
            const [label, href] = item.split(':');
            return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">{label}</Link>;
          })}
          {!user && <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2">Sign In</Link>}
        </div>
      )}
    </nav>
  );
}
