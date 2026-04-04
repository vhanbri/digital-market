import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import type { Crop } from '../types';

export interface CartItem {
  crop: Crop;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (crop: Crop, quantity?: number) => void;
  removeItem: (cropId: string) => void;
  updateQuantity: (cropId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (cropId: string) => boolean;
}

const CART_KEY = 'aniko_cart';
const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    if (items.length > 0) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(CART_KEY);
    }
  } catch {
    /* private mode / quota */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const skipNextPersist = useRef(true);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    persistCart(items);
  }, [items]);

  const addItem = useCallback((crop: Crop, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.crop.id === crop.id);
      if (existing) {
        return prev.map((i) =>
          i.crop.id === crop.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, crop.quantity) }
            : i,
        );
      }
      return [...prev, { crop, quantity: Math.min(quantity, crop.quantity) }];
    });
  }, []);

  const removeItem = useCallback((cropId: string) => {
    setItems((prev) => prev.filter((i) => i.crop.id !== cropId));
  }, []);

  const updateQuantity = useCallback((cropId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.crop.id !== cropId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.crop.id === cropId
          ? { ...i, quantity: Math.min(quantity, i.crop.quantity) }
          : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CART_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const isInCart = useCallback(
    (cropId: string) => items.some((i) => i.crop.id === cropId),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.crop.price * i.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
