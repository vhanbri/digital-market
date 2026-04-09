import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Search,
  Eye,
  ChevronDown,
  Package,
  MapPin,
  Phone,
  User,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { ADMIN_LINKS } from '../../../constants/admin';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Pagination } from '../../../components/ui/Pagination';

const PAGE_SIZE = 10;
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from '../../../services/admin.service';
import type { Order, OrderWithItems, OrderStatus } from '../../../types';

const STATUS_BADGE: Record<OrderStatus, 'yellow' | 'green' | 'red' | 'gray'> = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
  delivered: 'gray',
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'accepted', 'rejected', 'delivered'];

type OrderWithBuyer = Order & { profiles?: { name: string } };

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithBuyer[]>([]);
  const [filtered, setFiltered] = useState<OrderWithBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const [page, setPage] = useState(0);

  const [detailOrder, setDetailOrder] = useState<OrderWithItems | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
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
    const qs = router.query.status as string | undefined;
    if (qs && ALL_STATUSES.includes(qs as OrderStatus)) {
      setStatusFilter(qs as OrderStatus);
    }
  }, [router.query]);

  useEffect(() => {
    let result = orders;
    if (statusFilter) result = result.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) => o.id.toLowerCase().includes(q) || o.buyer_id.toLowerCase().includes(q) || (o.profiles?.name ?? '').toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [orders, statusFilter, search]);

  const handleView = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      setShowDetail(true);
      const order = await getAdminOrderById(orderId);
      setDetailOrder(order);
    } catch {
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openStatusModal = (order: Order) => {
    setStatusOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusUpdate = async () => {
    if (!statusOrder) return;
    try {
      setUpdating(true);
      const updated = await updateOrderStatus(statusOrder.id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      setStatusOrder(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update status');
    } finally {
      setUpdating(false);
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
        <title>Order Management - Admin - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={ADMIN_LINKS}
        sidebarTitle="Admin"
        pageTitle="Order Management"
        allowedRoles={['admin']}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              dismiss
            </button>
          </div>
        )}

        {/* Status summary cards */}
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
              <p className="text-2xl font-bold text-gray-900">
                {statusCounts[s] || 0}
              </p>
              <p className="text-xs font-medium capitalize text-gray-500">{s}</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by order ID or buyer name..."
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
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Buyer</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-600">
                          {order.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-700">
                          {order.profiles?.name ?? order.buyer_id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-900">
                          ₱{Number(order.total_price).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={STATUS_BADGE[order.status]} dot>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(order.id)}
                            title="View order details"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openStatusModal(order)}
                            title="Change status"
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                          >
                            Edit
                            <ChevronDown size={14} />
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

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          onPageChange={setPage}
        />
        <p className="mt-3 text-right text-xs text-gray-400">
          Showing {filtered.length} of {orders.length} orders
        </p>

        {/* Order Detail Modal */}
        <Modal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setDetailOrder(null);
          }}
          title="Order Details"
        >
          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : detailOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Order ID" value={detailOrder.id} />
                <DetailItem label="Buyer ID" value={detailOrder.buyer_id} />
                <DetailItem
                  label="Total"
                  value={`₱${Number(detailOrder.total_price).toFixed(2)}`}
                />
                <DetailItem label="Status" value={detailOrder.status} />
                <DetailItem
                  label="Created"
                  value={new Date(detailOrder.created_at).toLocaleString()}
                />
                <DetailItem
                  label="Updated"
                  value={new Date(detailOrder.updated_at).toLocaleString()}
                />
              </div>

              {(detailOrder.delivery_name || detailOrder.delivery_address || detailOrder.delivery_phone) && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Buyer / Delivery Information
                  </h4>
                  <div className="space-y-2 rounded-lg border border-gray-100 p-4">
                    {detailOrder.delivery_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="shrink-0 text-gray-400" />
                        <span className="font-medium text-gray-700">{detailOrder.delivery_name}</span>
                      </div>
                    )}
                    {detailOrder.delivery_address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                        <span className="text-gray-700">{detailOrder.delivery_address}</span>
                      </div>
                    )}
                    {detailOrder.delivery_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="shrink-0 text-gray-400" />
                        <span className="text-gray-700">{detailOrder.delivery_phone}</span>
                      </div>
                    )}
                    {detailOrder.delivery_notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText size={14} className="mt-0.5 shrink-0 text-gray-400" />
                        <span className="text-gray-600 italic">{detailOrder.delivery_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailOrder.items.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Items ({detailOrder.items.length})
                  </h4>
                  <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {detailOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Package size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {item.crops?.name ?? `Crop ${item.crop_id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                          ₱{(Number(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetail(false);
                    openStatusModal(detailOrder);
                  }}
                >
                  Change Status
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>

        {/* Status Update Modal */}
        <Modal
          isOpen={!!statusOrder}
          onClose={() => setStatusOrder(null)}
          title="Update Order Status"
        >
          {statusOrder && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Order{' '}
                <span className="font-mono font-semibold">
                  {statusOrder.id.slice(0, 8)}...
                </span>{' '}
                is currently{' '}
                <Badge variant={STATUS_BADGE[statusOrder.status]} dot>
                  {statusOrder.status}
                </Badge>
              </p>

              <div>
                <label
                  htmlFor="order-status-select"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  New Status
                </label>
                <select
                  id="order-status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Admins can set any status regardless of transition rules.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusOrder(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant={newStatus === 'rejected' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === statusOrder.status}
                >
                  {updating ? 'Updating...' : `Set to ${newStatus}`}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
