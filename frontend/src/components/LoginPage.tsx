'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, cartApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const { fetchCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await authApi.login(form);
      setToken(data.token);
      setUser(data.user);
      // Merge guest cart
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        try { await cartApi.merge(sessionId); } catch {}
      }
      await fetchCart();
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(redirect);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Login failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-500">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="you@example.com" className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required placeholder="••••••••" className="input" />
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500">
        <p className="font-medium mb-1">Demo accounts:</p>
        <p>Admin: admin@fashion.com / admin123</p>
        <p>User: user@example.com / user123</p>
      </div>
      <p className="text-center mt-4 text-sm text-gray-500">
        Don't have an account? <Link href="/auth/register" className="font-medium" style={{ color: 'var(--primary)' }}>Sign up</Link>
      </p>
    </div>
  );
}
