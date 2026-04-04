import { LayoutDashboard, ShoppingCart, ClipboardList } from 'lucide-react';
import type { SidebarLink } from '../components/Sidebar';

export const BUYER_LINKS: SidebarLink[] = [
  { href: '/dashboard/buyer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/buyer/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/dashboard/buyer/orders', label: 'Orders', icon: ClipboardList },
];

export { ADMIN_LINKS } from './admin';
