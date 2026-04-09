import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  ShoppingCart,
  ClipboardList,
  Wallet,
  ArrowRight,
  Store,
} from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { BUYER_LINKS } from '../../../constants/navigation';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useCart } from '../../../hooks/useCart';
import { getOrders } from '../../../services/order.service';
import type { Order, OrderStatus } from '../../../types';

const STATUS_BADGE: Record<OrderStatus, 'yellow' | 'green' | 'red' | 'gray'> = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
  delivered: 'gray',
};

export default function BuyerDashboard() {
  const { totalItems, totalPrice: cartTotal } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status === 'pending' || o.status === 'accepted').length;
  const totalSpent = orders
    .filter((o) => o.status === 'accepted' || o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: 'Items in Cart',
      value: totalItems,
      sub: cartTotal > 0 ? `₱${cartTotal.toFixed(2)} total` : undefined,
      icon: ShoppingCart,
      color: 'bg-brand-700',
      href: '/dashboard/buyer/cart',
    },
    {
      label: 'Active Orders',
      value: activeOrders,
      icon: ClipboardList,
      color: 'bg-yellow-600',
      href: '/dashboard/buyer/orders',
    },
    {
      label: 'Total Spent',
      value: `₱${totalSpent.toFixed(2)}`,
      icon: Wallet,
      color: 'bg-green-600',
    },
  ];

  return (
    <>
      <Head>
        <title>Buyer Dashboard - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={BUYER_LINKS}
        sidebarTitle="Buyer"
        pageTitle="Dashboard"
        allowedRoles={['buyer']}
      >
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const inner = (
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      {stat.sub && <p className="text-xs text-gray-400">{stat.sub}</p>}
                    </div>
                  </div>
                );
                return stat.href ? (
                  <Link key={stat.label} href={stat.href}>{inner}</Link>
                ) : (
                  <div key={stat.label}>{inner}</div>
                );
              })}
            </div>

            {/* Recent Orders */}
            <div className="mt-8 rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
                <Link
                  href="/dashboard/buyer/orders"
                  className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="mb-3 text-sm text-gray-400">
                    No orders yet. Browse the marketplace to get started!
                  </p>
                  <Link href="/marketplace">
                    <Button size="sm">
                      <Store size={16} />
                      Browse Marketplace
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between px-6 py-3.5">
                      <div>
                        <p className="font-mono text-xs text-gray-600">
                          {order.id.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          ₱{Number(order.total_price).toFixed(2)}
                        </span>
                        <Badge variant={STATUS_BADGE[order.status]} dot>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link href="/marketplace">
                  <Button size="sm">
                    <Store size={16} />
                    Browse Marketplace
                  </Button>
                </Link>
                <Link href="/dashboard/buyer/cart">
                  <Button variant="outline" size="sm">
                    <ShoppingCart size={16} />
                    View Cart ({totalItems})
                  </Button>
                </Link>
                <Link href="/dashboard/buyer/orders">
                  <Button variant="ghost" size="sm">
                    <ClipboardList size={16} />
                    My Orders
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </>
  );
}
