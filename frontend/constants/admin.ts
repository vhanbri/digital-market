import { LayoutDashboard, Users, Wheat, ClipboardList, BarChart3 } from 'lucide-react';
import type { SidebarLink } from '../components/Sidebar';

export const ADMIN_LINKS: SidebarLink[] = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/dashboard/admin/listings', label: 'Listings', icon: Wheat },
  { href: '/server-dashboard', label: 'Server', icon: BarChart3 },
];
