import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Users,
  Wheat,
  ClipboardList,
  TrendingUp,
  UserCheck,
  Clock,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { ADMIN_LINKS } from '../../../constants/admin';
import { Badge } from '../../../components/ui/Badge';
import { getAdminStats, getRecentOrders, AdminStats } from '../../../services/admin.service';
import type { Order, OrderStatus } from '../../../types';

const STATUS_BADGE: Record<OrderStatus, 'yellow' | 'green' | 'red' | 'gray'> = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
  delivered: 'gray',
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(err.message));
    getRecentOrders(5)
      .then(setRecentOrders)
      .catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>Admin Dashboard - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={ADMIN_LINKS}
        sidebarTitle="Admin"
        pageTitle="Dashboard Overview"
        allowedRoles={['admin']}
      >
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!stats && !error && (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                color="bg-brand-700"
                href="/dashboard/admin/users"
              />
              <StatCard
                icon={UserCheck}
                label="Buyers"
                value={stats.buyers}
                color="bg-blue-600"
                href="/dashboard/admin/users?role=buyer"
              />
              <StatCard
                icon={ClipboardList}
                label="Total Orders"
                value={stats.totalOrders}
                color="bg-purple-600"
                href="/dashboard/admin/orders"
              />
              <StatCard
                icon={Clock}
                label="Pending Orders"
                value={stats.pendingOrders}
                color="bg-yellow-600"
                href="/dashboard/admin/orders?status=pending"
              />
              <StatCard
                icon={Wheat}
                label="Total Listings"
                value={stats.totalCrops}
                color="bg-green-600"
                href="/dashboard/admin/listings"
              />
              <StatCard
                icon={Wallet}
                label="Total Revenue"
                value={`₱${stats.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                color="bg-emerald-600"
              />
            </div>

            {recentOrders.length > 0 && (
              <div className="mt-8 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
                  <Link
                    href="/dashboard/admin/orders"
                    className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900"
                  >
                    View all <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between px-6 py-3.5">
                      <div>
                        <p className="font-mono text-xs text-gray-600">{order.id.slice(0, 8)}...</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">₱{Number(order.total_price).toFixed(2)}</span>
                        <Badge variant={STATUS_BADGE[order.status]} dot>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard/admin/orders?status=pending"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Clock size={16} className="text-yellow-500" />
                    Review pending orders ({stats.pendingOrders})
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Users size={16} className="text-brand-600" />
                    Manage users ({stats.totalUsers})
                  </Link>
                  <Link
                    href="/dashboard/admin/listings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Wheat size={16} className="text-green-600" />
                    Manage produce listings ({stats.totalCrops})
                  </Link>
                  <Link
                    href="/server-dashboard"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    <TrendingUp size={16} className="text-purple-600" />
                    View platform dashboard
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Platform Status
                </h3>
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Registered Buyers</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.buyers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Listings</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totalCrops}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Order Completion
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totalOrders > 0
                        ? (
                            ((stats.totalOrders - stats.pendingOrders) /
                              stats.totalOrders) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </>
  );
}
