import { ReactNode } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar, SidebarLink } from '../components/Sidebar';
import { ProtectedRoute } from '../components/ProtectedRoute';
import type { UserRole } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarLinks: SidebarLink[];
  sidebarTitle: string;
  pageTitle: string;
  allowedRoles?: UserRole[];
}

export const DashboardLayout = ({
  children,
  sidebarLinks,
  sidebarTitle,
  pageTitle,
  allowedRoles,
}: DashboardLayoutProps) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar links={sidebarLinks} title={sidebarTitle} />
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-6 py-8">
              <h1 className="mb-6 text-2xl font-bold text-gray-900">
                {pageTitle}
              </h1>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
