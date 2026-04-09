import { ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:static lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar links={sidebarLinks} title={sidebarTitle} onNavigate={() => setSidebarOpen(false)} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
              <div className="mb-6 flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {pageTitle}
                </h1>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
