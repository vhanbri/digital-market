import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Search, Trash2, Eye, UserCircle } from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { ADMIN_LINKS } from '../../../constants/admin';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { getUsers, getUserById, deleteUser } from '../../../services/admin.service';
import type { User, UserRole } from '../../../types';

const ROLE_BADGE: Record<string, 'green' | 'yellow' | 'gray'> = {
  farmer: 'green',
  buyer: 'yellow',
  admin: 'gray',
};

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const q = router.query.role as string | undefined;
    if (q === 'farmer' || q === 'buyer' || q === 'admin') {
      setRoleFilter(q);
    }
  }, [router.query]);

  useEffect(() => {
    let result = users;
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [users, roleFilter, search]);

  const handleView = async (userId: string) => {
    try {
      const user = await getUserById(userId);
      setSelectedUser(user);
      setShowDetail(true);
    } catch {
      setSelectedUser(users.find((u) => u.id === userId) ?? null);
      setShowDetail(true);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteUser(confirmDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>User Management - Admin - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={ADMIN_LINKS}
        sidebarTitle="Admin"
        pageTitle="User Management"
        allowedRoles={['admin']}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['', 'farmer', 'buyer', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r as UserRole | '')}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  roleFilter === r
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <UserCircle size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={ROLE_BADGE[user.role]} dot>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {user.location ?? '--'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(user.id)}
                            title="View details"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Eye size={16} />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => setConfirmDelete(user)}
                              title="Delete user"
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-right text-xs text-gray-400">
          Showing {filtered.length} of {users.length} users
        </p>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          title="User Details"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <UserCircle size={28} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Role" value={selectedUser.role} />
                <InfoItem
                  label="Location"
                  value={selectedUser.location ?? 'Not set'}
                />
                <InfoItem
                  label="Joined"
                  value={new Date(selectedUser.created_at).toLocaleString()}
                />
                <InfoItem
                  label="Last Updated"
                  value={new Date(selectedUser.updated_at).toLocaleString()}
                />
                <InfoItem
                  label="User ID"
                  value={selectedUser.id}
                />
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          title="Delete User"
        >
          <p className="mb-4 text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">
              {confirmDelete?.name}
            </span>{' '}
            ({confirmDelete?.email})? This action cannot be undone and will also
            remove all their associated data.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
