import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import {
  Search,
  Eye,
  Package,
  DollarSign,
} from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { BUYER_LINKS } from '../../../constants/navigation';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { getOrders, getOrderById } from '../../../services/order.service';
import type { Order, OrderWithItems, OrderStatus } from '../../../types';

const STATUS_BADGE: Record<OrderStatus, 'yellow' | 'green' | 'red' | 'gray'> = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
  delivered: 'gray',
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'accepted', 'rejected', 'delivered'];

const STATUS_STEP: Record<OrderStatus, number> = {
  pending: 0,
  accepted: 1,
  delivered: 2,
  rejected: -1,
};

const STEPS = ['Order Placed', 'Accepted', 'Delivered'];

export default function BuyerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const [detailOrder, setDetailOrder] = useState<OrderWithItems | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let result = orders;
    if (statusFilter) result = result.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [orders, statusFilter, search]);

  const handleView = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      setShowDetail(true);
      const order = await getOrderById(orderId);
      setDetailOrder(order);
    } catch {
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <Head>
        <title>My Orders - Buyer - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={BUYER_LINKS}
        sidebarTitle="Buyer"
        pageTitle="My Orders"
        allowedRoles={['buyer']}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Status cards */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={`rounded-xl border p-4 text-center transition-all ${
                statusFilter === s
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{statusCounts[s] || 0}</p>
              <p className="text-xs font-medium capitalize text-gray-500">{s}</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-xs font-medium text-brand-700 underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {orders.length === 0
                ? "You haven't placed any orders yet."
                : 'No orders match your filter.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-600">
                          {order.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        ${Number(order.total_price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={STATUS_BADGE[order.status]} dot>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleView(order.id)}
                            title="View order details"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-right text-xs text-gray-400">
          Showing {filtered.length} of {orders.length} orders
        </p>

        {/* Order Detail Modal */}
        <Modal
          isOpen={showDetail}
          onClose={() => { setShowDetail(false); setDetailOrder(null); }}
          title="Order Details"
        >
          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : detailOrder ? (
            <div className="space-y-5">
              {/* Progress tracker */}
              {detailOrder.status !== 'rejected' ? (
                <div className="flex items-center justify-between">
                  {STEPS.map((step, idx) => {
                    const current = STATUS_STEP[detailOrder.status];
                    const done = idx <= current;
                    return (
                      <div key={step} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              done
                                ? 'bg-green-500 text-white'
                                : 'border-2 border-gray-200 text-gray-400'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <p className={`mt-1 text-[10px] font-medium ${done ? 'text-green-600' : 'text-gray-400'}`}>
                            {step}
                          </p>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div
                            className={`mx-2 h-0.5 flex-1 ${
                              idx < current ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                  This order was rejected.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Order ID" value={detailOrder.id} />
                <DetailItem label="Total" value={`$${Number(detailOrder.total_price).toFixed(2)}`} />
                <DetailItem label="Status" value={detailOrder.status} />
                <DetailItem label="Date" value={new Date(detailOrder.created_at).toLocaleString()} />
              </div>

              {detailOrder.items.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Items ({detailOrder.items.length})
                  </h4>
                  <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {detailOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Package size={16} className="text-gray-400" />
                          <div>
                            <p className="font-mono text-xs text-gray-600">
                              Crop: {item.crop_id.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                          <DollarSign size={14} />
                          {(Number(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      </DashboardLayout>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">{label}</p>
      <p className="truncate text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
