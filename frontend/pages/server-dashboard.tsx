import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  Users,
  Wheat,
  ClipboardList,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Database,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const POLL_INTERVAL = 10_000;

interface PlatformStats {
  totalUsers: number;
  buyers: number;
  admins: number;
  totalCrops: number;
  inStockCrops: number;
  outOfStockCrops: number;
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  deliveredOrders: number;
  rejectedOrders: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'bg-brand-50 text-brand-700',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            {label}
          </p>
          <p className="truncate text-lg font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ServerDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const [
        { count: totalUsers },
        { count: buyers },
        { count: admins },
        { count: totalCrops },
        { count: outOfStockCrops },
        { count: totalOrders },
        { count: pendingOrders },
        { count: acceptedOrders },
        { count: deliveredOrders },
        { count: rejectedOrders },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('crops').select('*', { count: 'exact', head: true }),
        supabase.from('crops').select('*', { count: 'exact', head: true }).eq('quantity', 0),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      ]);

      const tc = totalCrops ?? 0;
      const oos = outOfStockCrops ?? 0;

      setStats({
        totalUsers: totalUsers ?? 0,
        buyers: buyers ?? 0,
        admins: admins ?? 0,
        totalCrops: tc,
        inStockCrops: tc - oos,
        outOfStockCrops: oos,
        totalOrders: totalOrders ?? 0,
        pendingOrders: pendingOrders ?? 0,
        acceptedOrders: acceptedOrders ?? 0,
        deliveredOrders: deliveredOrders ?? 0,
        rejectedOrders: rejectedOrders ?? 0,
      });
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(fetchStats, POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, fetchStats]);

  return (
    <>
      <Head>
        <title>Platform Dashboard - AniKo</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800">
                  <BarChart3 size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Platform Dashboard
                  </h1>
                  <p className="text-xs text-gray-500">
                    AniKo — Powered by Supabase
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => setPaused(!paused)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  paused
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {paused ? 'Paused' : `Live (${POLL_INTERVAL / 1000}s)`}
              </button>
              <button
                onClick={fetchStats}
                title="Refresh"
                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <XCircle size={18} className="shrink-0" />
              <div>
                <p className="font-semibold">Connection Error</p>
                <p className="text-red-500">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          )}

          {stats && (
            <>
              <section>
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Platform Health
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                    </span>
                    <div>
                      <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                        Status
                      </p>
                      <p className="text-lg font-bold text-gray-900">Online</p>
                    </div>
                  </div>
                  <StatCard
                    icon={Database}
                    label="Backend"
                    value="Supabase"
                    sub="Managed PostgreSQL"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Auth"
                    value="Active"
                    sub="Supabase Auth + RLS"
                    color="bg-green-50 text-green-700"
                  />
                  <StatCard
                    icon={Clock}
                    label="Auto-Refresh"
                    value={paused ? 'Paused' : `${POLL_INTERVAL / 1000}s`}
                    sub="Polling interval"
                  />
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Users
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats.totalUsers}
                    color="bg-brand-50 text-brand-700"
                  />
                  <StatCard
                    icon={ShoppingCart}
                    label="Buyers"
                    value={stats.buyers}
                    color="bg-blue-50 text-blue-700"
                  />
                  <StatCard
                    icon={Users}
                    label="Admins"
                    value={stats.admins}
                    color="bg-purple-50 text-purple-700"
                  />
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Listings
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatCard
                    icon={Wheat}
                    label="Total Crops"
                    value={stats.totalCrops}
                    color="bg-green-50 text-green-700"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="In Stock"
                    value={stats.inStockCrops}
                    color="bg-emerald-50 text-emerald-700"
                  />
                  <StatCard
                    icon={XCircle}
                    label="Out of Stock"
                    value={stats.outOfStockCrops}
                    color={stats.outOfStockCrops > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500'}
                  />
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Orders
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  <StatCard
                    icon={ClipboardList}
                    label="Total"
                    value={stats.totalOrders}
                    color="bg-brand-50 text-brand-700"
                  />
                  <StatCard
                    icon={Clock}
                    label="Pending"
                    value={stats.pendingOrders}
                    color="bg-yellow-50 text-yellow-700"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Accepted"
                    value={stats.acceptedOrders}
                    color="bg-green-50 text-green-700"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Delivered"
                    value={stats.deliveredOrders}
                    color="bg-gray-100 text-gray-600"
                  />
                  <StatCard
                    icon={XCircle}
                    label="Rejected"
                    value={stats.rejectedOrders}
                    color={stats.rejectedOrders > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500'}
                  />
                </div>
              </section>

              {stats.totalOrders > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    Order Breakdown
                  </h2>
                  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="space-y-4">
                      {[
                        { label: 'Pending', count: stats.pendingOrders, color: 'bg-yellow-500' },
                        { label: 'Accepted', count: stats.acceptedOrders, color: 'bg-green-500' },
                        { label: 'Delivered', count: stats.deliveredOrders, color: 'bg-blue-500' },
                        { label: 'Rejected', count: stats.rejectedOrders, color: 'bg-red-500' },
                      ].map(({ label, count, color }) => {
                        const pct = stats.totalOrders > 0
                          ? (count / stats.totalOrders) * 100
                          : 0;
                        return (
                          <div key={label}>
                            <div className="mb-1 flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{label}</span>
                              <span className="font-semibold text-gray-900">
                                {count} ({pct.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${color}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
