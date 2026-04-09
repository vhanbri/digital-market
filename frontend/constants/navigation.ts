import { LayoutDashboard, ShoppingCart, ClipboardList, UserCircle } from 'lucide-react';
import type { SidebarLink } from '../components/Sidebar';

export const BUYER_LINKS: SidebarLink[] = [
  { href: '/dashboard/buyer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/buyer/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/dashboard/buyer/orders', label: 'Orders', icon: ClipboardList },
  { href: '/dashboard/buyer/profile', label: 'Profile', icon: UserCircle },
];

export { ADMIN_LINKS } from './admin';
