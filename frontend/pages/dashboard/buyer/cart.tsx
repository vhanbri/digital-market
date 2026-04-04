import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  CheckCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { BUYER_LINKS } from '../../../constants/navigation';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useCart } from '../../../hooks/useCart';
import { placeOrder } from '../../../services/order.service';

export default function BuyerCart() {
  const router = useRouter();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    try {
      setPlacing(true);
      setError(null);
      await placeOrder(
        items.map((i) => ({ crop_id: i.crop.id, quantity: i.quantity })),
      );
      clearCart();
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Shopping Cart - Buyer - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={BUYER_LINKS}
        sidebarTitle="Buyer"
        pageTitle="Shopping Cart"
        allowedRoles={['buyer']}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline">
              dismiss
            </button>
          </div>
        )}

        {items.length === 0 && !showSuccess ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="mb-1 text-lg font-medium text-gray-700">Your cart is empty</p>
            <p className="mb-6 text-sm text-gray-400">
              Browse the marketplace and add items to get started.
            </p>
            <Link href="/marketplace">
              <Button>
                <Store size={16} />
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : !showSuccess ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                  </h3>
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(({ crop, quantity }) => (
                    <div
                      key={crop.id}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                        <span className="text-2xl">🌾</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{crop.name}</p>
                        <p className="text-sm text-gray-500">
                          ${Number(crop.price).toFixed(2)} per unit
                        </p>
                        {crop.quantity < 10 && (
                          <p className="text-xs text-amber-600">
                            Only {crop.quantity} left in stock
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(crop.id, quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(crop.id, quantity + 1)}
                          disabled={quantity >= crop.quantity}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="w-20 text-right text-sm font-semibold text-gray-900">
                        ${(Number(crop.price) * quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(crop.id)}
                        title="Remove item"
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Order Summary</h3>
                <div className="space-y-3 border-b border-gray-100 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <Button
                  fullWidth
                  onClick={handleCheckout}
                  disabled={placing || items.length === 0}
                >
                  {placing ? 'Placing Order...' : 'Place Order'}
                </Button>
                <Link
                  href="/marketplace"
                  className="mt-3 block text-center text-xs font-medium text-brand-700 hover:text-brand-900"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Success Modal */}
        <Modal
          isOpen={showSuccess}
          onClose={() => { setShowSuccess(false); router.push('/dashboard/buyer/orders'); }}
          title="Order Placed!"
        >
          <div className="py-4 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <p className="mb-2 text-lg font-semibold text-gray-900">
              Your order has been placed successfully!
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Our team will review your order shortly. You can track the status
              in your orders page.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowSuccess(false); router.push('/marketplace'); }}
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => { setShowSuccess(false); router.push('/dashboard/buyer/orders'); }}
              >
                View Orders
              </Button>
            </div>
          </div>
        </Modal>

        {/* Clear Cart Confirmation */}
        <Modal
          isOpen={confirmClear}
          onClose={() => setConfirmClear(false)}
          title="Clear Cart"
        >
          <p className="mb-4 text-sm text-gray-600">
            Are you sure you want to remove all items from your cart?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => { clearCart(); setConfirmClear(false); }}
            >
              Clear Cart
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </>
  );
}
