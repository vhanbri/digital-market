import { Badge } from '../ui/Badge';

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'delivered';

interface OrderRow {
  id: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  itemCount?: number;
}

interface OrderTableProps {
  orders: OrderRow[];
  onRowClick?: (id: string) => void;
  emptyMessage?: string;
}

const STATUS_BADGE: Record<OrderStatus, { variant: 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  pending: { variant: 'yellow', label: 'Pending' },
  accepted: { variant: 'green', label: 'Accepted' },
  rejected: { variant: 'red', label: 'Rejected' },
  delivered: { variant: 'green', label: 'Delivered' },
};

export const OrderTable = ({
  orders,
  onRowClick,
  emptyMessage = 'No orders yet.',
}: OrderTableProps) => {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-6 py-3 font-medium text-gray-500">Order ID</th>
            <th className="px-6 py-3 font-medium text-gray-500">Date</th>
            <th className="px-6 py-3 font-medium text-gray-500">Status</th>
            <th className="px-6 py-3 text-right font-medium text-gray-500">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const badge = STATUS_BADGE[order.status];
            return (
              <tr
                key={order.id}
                onClick={() => onRowClick?.(order.id)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={badge.variant} dot>
                    {badge.label}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  ₱{order.total_price.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
