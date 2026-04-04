import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Minus,
  Plus,
  Calendar,
  Package,
  Clock,
} from 'lucide-react';
import { MainLayout } from '../../layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getCropById } from '../../services/crop.service';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import type { Crop } from '../../types';

export default function CropDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem, isInCart, updateQuantity, items } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    getCropById(id)
      .then(setCrop)
      .catch((err) => setError(err.message ?? 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const inCart = crop ? isInCart(crop.id) : false;
  const cartItem = crop ? items.find((i) => i.crop.id === crop.id) : undefined;
  const isBuyer = isAuthenticated && user?.role === 'buyer';
  const outOfStock = crop ? crop.quantity === 0 : true;

  const handleAddToCart = () => {
    if (!crop || outOfStock) return;
    addItem(crop, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Head>
        <title>{crop ? `${crop.name} - AniKo` : 'Product - AniKo'}</title>
      </Head>
      <MainLayout>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/marketplace"
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Marketplace
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
              <button
                onClick={() => router.reload()}
                className="ml-2 font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Product */}
          {crop && !loading && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Image */}
              <div className="flex h-64 items-center justify-center bg-gradient-to-br from-brand-50 to-green-50 sm:h-80">
                <span className="text-7xl">🌾</span>
              </div>

              <div className="p-6 sm:p-8">
                {/* Title + Price */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {crop.name}
                    </h1>
                    {crop.description && (
                      <p className="mt-2 text-base leading-relaxed text-gray-600">
                        {crop.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-brand-800">
                      ${Number(crop.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">per unit</p>
                  </div>
                </div>

                {/* Info badges */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant={crop.quantity > 0 ? 'green' : 'red'} dot>
                    {crop.quantity > 0
                      ? `${crop.quantity} units in stock`
                      : 'Out of stock'}
                  </Badge>
                  {crop.harvest_date && (
                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      <Calendar size={12} />
                      Harvest:{' '}
                      {new Date(crop.harvest_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    <Clock size={12} />
                    Listed{' '}
                    {new Date(crop.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Divider */}
                <hr className="my-6 border-gray-100" />

                {/* Add to Cart section */}
                {isBuyer && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {!inCart ? (
                      <>
                        {/* Quantity selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Qty:
                          </span>
                          <div className="flex items-center rounded-lg border border-gray-200">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => setQty((q) => Math.max(1, q - 1))}
                              disabled={qty <= 1}
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-gray-900">
                              {qty}
                            </span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() =>
                                setQty((q) =>
                                  Math.min(crop.quantity, q + 1),
                                )
                              }
                              disabled={qty >= crop.quantity}
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <Button
                          size="lg"
                          disabled={outOfStock}
                          onClick={handleAddToCart}
                        >
                          {added ? (
                            <>
                              <Check size={18} />
                              Added!
                            </>
                          ) : outOfStock ? (
                            'Out of Stock'
                          ) : (
                            <>
                              <ShoppingCart size={18} />
                              Add to Cart &mdash; $
                              {(Number(crop.price) * qty).toFixed(2)}
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            In cart:
                          </span>
                          <div className="flex items-center rounded-lg border border-gray-200">
                            <button
                              aria-label="Decrease cart quantity"
                              onClick={() =>
                                updateQuantity(
                                  crop.id,
                                  (cartItem?.quantity ?? 1) - 1,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-gray-900">
                              {cartItem?.quantity ?? 0}
                            </span>
                            <button
                              aria-label="Increase cart quantity"
                              onClick={() =>
                                updateQuantity(
                                  crop.id,
                                  (cartItem?.quantity ?? 0) + 1,
                                )
                              }
                              disabled={
                                (cartItem?.quantity ?? 0) >= crop.quantity
                              }
                              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <Link href="/dashboard/buyer/cart">
                          <Button variant="outline">
                            <Package size={16} />
                            View Cart
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {!isAuthenticated && !outOfStock && (
                  <div className="rounded-lg border border-brand-100 bg-brand-50 px-5 py-4">
                    <p className="text-sm text-brand-800">
                      <Link
                        href="/auth/login?redirect=/crop/[id]"
                        as={`/auth/login?redirect=/crop/${crop.id}`}
                        className="font-semibold underline"
                      >
                        Sign in
                      </Link>{' '}
                      or{' '}
                      <Link
                        href="/auth/register"
                        className="font-semibold underline"
                      >
                        create an account
                      </Link>{' '}
                      to start ordering fresh produce.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
