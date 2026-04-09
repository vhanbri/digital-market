import Link from 'next/link';
import { Calendar, ShoppingCart, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import type { Crop } from '../../types';

interface CropCardProps {
  crop: Crop;
}

export const CropCard = ({ crop }: CropCardProps) => {
  const { addItem, isInCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const inCart = isInCart(crop.id);
  const outOfStock = crop.quantity === 0;
  const lowStock = crop.quantity > 0 && crop.quantity <= 10;
  const isBuyer = isAuthenticated && user?.role === 'buyer';

  return (
    <div className={`group flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md ${outOfStock ? 'border-gray-200 opacity-75' : 'border-gray-200'}`}>
      <Link href={`/crop/${crop.id}`}>
        <div className="relative flex h-40 items-center justify-center bg-brand-50 transition-colors group-hover:bg-brand-100">
          <span className="text-4xl">🌾</span>
          {outOfStock && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Sold Out
            </span>
          )}
          {lowStock && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Only {crop.quantity} left
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between">
          <Link href={`/crop/${crop.id}`} className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-800">
              {crop.name}
            </h3>
          </Link>
          <span className="ml-2 whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-800">
            ₱{Number(crop.price).toFixed(2)}
          </span>
        </div>

        {crop.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-500">
            {crop.description}
          </p>
        )}

        <div className="mt-auto space-y-2">
          <div className="space-y-1.5 text-xs text-gray-400">
            {crop.harvest_date && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  Harvest: {new Date(crop.harvest_date).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className={outOfStock ? 'font-medium text-red-500' : lowStock ? 'font-medium text-amber-600' : ''}>
              {outOfStock
                ? 'Out of stock'
                : `${crop.quantity} units available`}
            </div>
          </div>

          {isBuyer && (
            <Button
              size="sm"
              fullWidth
              variant={inCart ? 'outline' : 'primary'}
              disabled={outOfStock || inCart}
              onClick={(e) => {
                e.preventDefault();
                if (!inCart && !outOfStock) addItem(crop);
              }}
            >
              {inCart ? (
                <>
                  <Check size={14} />
                  In Cart
                </>
              ) : outOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Add to Cart
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
