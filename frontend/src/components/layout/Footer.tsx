'use client';
import Link from 'next/link';
import { useThemeStore } from '@/store/themeStore';

export function Footer() {
  const { theme } = useThemeStore();
  const logoText = theme?.['logo-text'] || 'FashionHub';
  const tagline = theme?.tagline || 'Dress to Impress';

  return (
    <footer className="border-t border-gray-200 mt-20" style={{ backgroundColor: 'var(--secondary)', color: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-heading font-bold mb-2" style={{ color: 'var(--primary)' }}>{logoText}</h3>
            <p className="text-gray-400 text-sm">{tagline}</p>
            <p className="text-gray-400 text-sm mt-2">Your premium fashion destination for the modern wardrobe.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[['All Products', '/products'], ['New Arrivals', '/products?sort=createdAt_desc'], ['Featured', '/products?featured=true'], ['Sale', '/products?sale=true']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[['Tops', '/products?category=tops'], ['Bottoms', '/products?category=bottoms'], ['Dresses', '/products?category=dresses'], ['Outerwear', '/products?category=outerwear'], ['Shoes', '/products?category=shoes'], ['Accessories', '/products?category=accessories']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[['My Account', '/profile'], ['Orders', '/orders'], ['Wishlist', '/wishlist'], ['Sign In', '/auth/login']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>© 2026 {logoText}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
