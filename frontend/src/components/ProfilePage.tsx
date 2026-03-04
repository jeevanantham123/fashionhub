'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { Address } from '@/types';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', currentPassword: '', newPassword: '' });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddr, setNewAddr] = useState({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'US', isDefault: false });
  const [showAddr, setShowAddr] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    setForm(f => ({ ...f, name: user.name }));
    authApi.addresses().then(({ data }) => setAddresses(data));
  }, [user]);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await authApi.updateMe({ name: form.name, currentPassword: form.currentPassword || undefined, newPassword: form.newPassword || undefined });
      setUser(data);
      toast.success('Profile updated!');
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Update failed');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await authApi.addAddress(newAddr);
      setAddresses(p => [...p, data]);
      setShowAddr(false);
      setNewAddr({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'US', isDefault: false });
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (id: string) => {
    await authApi.deleteAddress(id);
    setAddresses(p => p.filter(a => a.id !== id));
    toast.success('Address removed');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-heading font-bold mb-8">My Profile</h1>

      {/* Profile form */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-4">Account Details</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={user?.email} disabled className="input bg-gray-50 text-gray-500" />
          </div>
          <hr />
          <p className="text-sm text-gray-500">Leave blank to keep current password</p>
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" className="input" />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>

      {/* Addresses */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Saved Addresses</h2>
          <button onClick={() => setShowAddr(!showAddr)} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>+ Add Address</button>
        </div>
        {showAddr && (
          <form onSubmit={handleAddAddress} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} placeholder="Label" className="input" />
              <input value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} placeholder="Street" required className="input" />
              <input value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} placeholder="City" required className="input" />
              <input value={newAddr.state} onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))} placeholder="State" required className="input" />
              <input value={newAddr.zip} onChange={e => setNewAddr(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP" required className="input" />
              <input value={newAddr.country} onChange={e => setNewAddr(p => ({ ...p, country: e.target.value }))} placeholder="Country" className="input" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm px-4 py-2">Save</button>
              <button type="button" onClick={() => setShowAddr(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-start justify-between p-3 border rounded">
              <div>
                <p className="font-medium text-sm">{addr.label} {addr.isDefault && <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: 'var(--accent)', color: 'var(--secondary)' }}>Default</span>}</p>
                <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
              </div>
              <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            </div>
          ))}
          {addresses.length === 0 && <p className="text-sm text-gray-500">No addresses saved</p>}
        </div>
      </div>
    </div>
  );
}
