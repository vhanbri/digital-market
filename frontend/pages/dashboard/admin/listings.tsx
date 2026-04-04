import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { Search, Trash2, Eye, Pencil, Plus, Wheat } from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { ADMIN_LINKS } from '../../../constants/admin';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { FormInput } from '../../../components/ui/FormInput';
import {
  getAdminCrops,
  createAdminCrop,
  updateAdminCrop,
  deleteAdminCrop,
} from '../../../services/admin.service';
import type { Crop } from '../../../types';

interface CropFormData {
  name: string;
  price: string;
  quantity: string;
  description: string;
  harvest_date: string;
}

const EMPTY_FORM: CropFormData = {
  name: '',
  price: '',
  quantity: '',
  description: '',
  harvest_date: '',
};

export default function AdminListings() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editCrop, setEditCrop] = useState<Crop | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Crop | null>(null);

  const [form, setForm] = useState<CropFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminCrops(PAGE_SIZE, page * PAGE_SIZE);
      setCrops(data.crops);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const filtered = search.trim()
    ? crops.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : crops;

  const handleField = (field: keyof CropFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowCreate(true);
  };

  const openEdit = (crop: Crop) => {
    setForm({
      name: crop.name,
      price: String(crop.price),
      quantity: String(crop.quantity),
      description: crop.description ?? '',
      harvest_date: crop.harvest_date ? crop.harvest_date.split('T')[0] : '',
    });
    setFormError(null);
    setEditCrop(crop);
  };

  const handleCreateSubmit = async () => {
    if (!form.name.trim() || !form.price || !form.quantity) {
      setFormError('Name, price, and quantity are required.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError(null);
      const created = await createAdminCrop({
        name: form.name.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        description: form.description.trim() || undefined,
        harvest_date: form.harvest_date || undefined,
      });
      setCrops((prev) => [created, ...prev]);
      setTotal((t) => t + 1);
      setShowCreate(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editCrop) return;
    if (!form.name.trim() || !form.price || !form.quantity) {
      setFormError('Name, price, and quantity are required.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError(null);
      const updated = await updateAdminCrop(editCrop.id, {
        name: form.name.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        description: form.description.trim() || undefined,
        harvest_date: form.harvest_date || undefined,
      });
      setCrops((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditCrop(null);
    } catch (err: any) {
      setFormError(err.message ?? 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteAdminCrop(confirmDelete.id);
      setCrops((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setTotal((t) => t - 1);
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Head>
        <title>Manage Listings - Admin - AniKo</title>
      </Head>
      <DashboardLayout
        sidebarLinks={ADMIN_LINKS}
        sidebarTitle="Admin"
        pageTitle="Manage Listings"
        allowedRoles={['admin']}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline">
              dismiss
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search crop name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <p className="text-sm text-gray-500">
              {total} listing{total !== 1 && 's'}
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} />
            New Listing
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {crops.length === 0
                ? 'No listings yet. Add your first produce listing!'
                : 'No listings match your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Crop</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((crop) => (
                    <tr key={crop.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                            <Wheat size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{crop.name}</p>
                            {crop.description && (
                              <p className="max-w-[200px] truncate text-xs text-gray-500">
                                {crop.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        ${Number(crop.price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-semibold ${crop.quantity === 0 ? 'text-red-600' : crop.quantity < 10 ? 'text-yellow-600' : 'text-gray-900'}`}
                        >
                          {crop.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={crop.quantity > 0 ? 'green' : 'red'} dot>
                          {crop.quantity > 0 ? 'Active' : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {new Date(crop.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedCrop(crop); setShowDetail(true); }}
                            title="View details"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(crop)}
                            title="Edit listing"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(crop)}
                            title="Remove listing"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Listing Details">
          {selectedCrop && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Wheat size={24} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedCrop.name}</p>
                  <p className="text-sm text-gray-500">{selectedCrop.description ?? 'No description'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Listing ID" value={selectedCrop.id} />
                <InfoItem label="Price" value={`$${Number(selectedCrop.price).toFixed(2)}`} />
                <InfoItem label="Stock" value={String(selectedCrop.quantity)} />
                <InfoItem
                  label="Harvest Date"
                  value={selectedCrop.harvest_date ? new Date(selectedCrop.harvest_date).toLocaleDateString() : 'Not set'}
                />
                <InfoItem label="Created" value={new Date(selectedCrop.created_at).toLocaleString()} />
                <InfoItem label="Updated" value={new Date(selectedCrop.updated_at).toLocaleString()} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDetail(false); openEdit(selectedCrop); }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => { setShowDetail(false); setConfirmDelete(selectedCrop); }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Modal */}
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Produce Listing">
          <CropForm
            form={form}
            onChange={handleField}
            error={formError}
            submitting={submitting}
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreate(false)}
            submitLabel="Create Listing"
          />
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={!!editCrop} onClose={() => setEditCrop(null)} title="Edit Listing">
          <CropForm
            form={form}
            onChange={handleField}
            error={formError}
            submitting={submitting}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditCrop(null)}
            submitLabel="Save Changes"
          />
        </Modal>

        {/* Delete Confirmation */}
        <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove Listing">
          <p className="mb-4 text-sm text-gray-600">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-gray-900">{confirmDelete?.name}</span>?
            This will permanently delete the produce listing.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing...' : 'Remove Listing'}
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </>
  );
}

function CropForm({
  form,
  onChange,
  error,
  submitting,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: CropFormData;
  onChange: (field: keyof CropFormData, value: string) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <FormInput
        label="Crop Name"
        value={form.name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder="e.g. Organic Tomatoes"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label="Price ($)"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => onChange('price', e.target.value)}
          placeholder="0.00"
          required
        />
        <FormInput
          label="Quantity"
          type="number"
          min="0"
          value={form.quantity}
          onChange={(e) => onChange('quantity', e.target.value)}
          placeholder="0"
          required
        />
      </div>
      <FormInput
        label="Harvest Date"
        type="date"
        value={form.harvest_date}
        onChange={(e) => onChange('harvest_date', e.target.value)}
      />
      <div className="space-y-1">
        <label htmlFor="crop-description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="crop-description"
          rows={3}
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the produce..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">{label}</p>
      <p className="truncate text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
