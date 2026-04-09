import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Sprout,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ClipboardList,
  Store,
  BarChart3,
  Users,
} from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ElementType;
}

const GUEST_LINKS: NavLink[] = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/#farmers', label: 'For Suppliers' },
  { href: '/#buyers', label: 'For Buyers' },
  { href: '/#about', label: 'About' },
];

const ROLE_LINKS: Record<string, NavLink[]> = {
  buyer: [
    { href: '/marketplace', label: 'Marketplace', icon: Store },
    { href: '/dashboard/buyer/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/dashboard/buyer/orders', label: 'My Orders', icon: ClipboardList },
  ],
  admin: [
    { href: '/marketplace', label: 'Marketplace', icon: Store },
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/server-dashboard', label: 'Platform', icon: BarChart3 },
  ],
};

const DASHBOARD_ROUTES: Record<string, string> = {
  buyer: '/dashboard/buyer',
  admin: '/dashboard/admin',
};

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = useMemo(() => {
    if (isAuthenticated && user) return ROLE_LINKS[user.role] ?? GUEST_LINKS;
    return GUEST_LINKS;
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800">
            <Sprout size={18} className="text-white" />
          </span>
          <span className="text-xl font-bold text-brand-800">Ani<span className="text-amber-500">Ko</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isCart = link.href === '/dashboard/buyer/cart';
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                {Icon && isAuthenticated && <Icon size={15} className="text-gray-400" />}
                {link.label}
                {isCart && totalItems > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {user.role === 'buyer' && (
                <Link
                  href="/dashboard/buyer/cart"
                  className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>
              )}

              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                    <User size={14} />
                  </span>
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                        {user.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        href={DASHBOARD_ROUTES[user.role] ?? '/'}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
