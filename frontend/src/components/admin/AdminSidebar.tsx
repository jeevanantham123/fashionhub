'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tag, ShoppingBag, Users, Ticket, Boxes, Palette, Home, ArrowLeft, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/theme', label: 'Theme & Sections', icon: Palette },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { theme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const logoText = theme?.['logo-text'] || 'FashionHub';

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200 min-h-screen`} style={{ borderRightColor: '#e5e7eb' }}>
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && <span className="font-heading font-bold text-lg" style={{ color: 'var(--primary)' }}>{logoText}</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-100 rounded">
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`} style={active ? { backgroundColor: 'var(--primary)' } : {}}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100`}>
          <ArrowLeft size={18} />
          {!collapsed && <span>Back to Store</span>}
        </Link>
      </div>
    </aside>
  );
}
