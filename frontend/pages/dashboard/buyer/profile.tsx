import { useState, useEffect } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { BUYER_LINKS } from '../../../constants/navigation';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

export default function BuyerProfile() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setLocation(user.location ?? '');
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }
    try {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name: name.trim(), location: location.trim() || null, phone: phone.trim() || null })
        .eq('id', user.id);
      if (updateError) throw new Error(updateError.message);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>My Profile - Buyer - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={BUYER_LINKS}
        sidebarTitle="Buyer"
        pageTitle="My Profile"
        allowedRoles={['buyer']}
      >
        <div className="mx-auto max-w-lg">
          {!user ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-800">
                {(user.name || '?').charAt(0).toUpperCase()}
              </div>
              <p className="mt-3 text-sm text-gray-500">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                {user.role}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="profile-location" className="mb-1 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="profile-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Cebu City"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 09171234567"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
