import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, Wheat, X, ArrowUpDown } from 'lucide-react';
import { CropCard } from '../crops/CropCard';
import { Button } from '../ui/Button';
import { getCrops } from '../../services/crop.service';
import type { CropSortOption } from '../../services/crop.service';
import type { Crop } from '../../types';

const SORT_OPTIONS: { value: CropSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
];

const PAGE_SIZE = 12;

export default function MarketplaceContent() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<CropSortOption>('newest');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCrops({
        search: debouncedSearch || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sortBy,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setCrops(data.crops);
      setTotal(data.total);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load marketplace';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasActiveFilters = Boolean(minPrice || maxPrice);

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="mt-1 text-gray-500">
          Browse fresh, Cebu-sourced produce from our partner farms.
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search produce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  !
                </span>
              )}
            </button>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as CropSortOption); setPage(0); }}
                className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-400">
              {total} {total === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1">
              <label
                htmlFor="filter-min"
                className="block text-xs font-medium text-gray-500"
              >
                Min Price (₱)
              </label>
              <input
                id="filter-min"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(0);
                }}
                className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="filter-max"
                className="block text-xs font-medium text-gray-500"
              >
                Max Price (₱)
              </label>
              <input
                id="filter-max"
                type="number"
                min="0"
                step="0.01"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(0);
                }}
                className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={() => {
              setError(null);
              fetchCrops();
            }}
            className="ml-2 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}

      {!loading && !error && crops.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-20 text-center">
          <Wheat size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="mb-1 text-lg font-medium text-gray-700">
            No produce found
          </p>
          <p className="mb-6 text-sm text-gray-400">
            {debouncedSearch || hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Check back soon — new listings are added regularly.'}
          </p>
          {(debouncedSearch || hasActiveFilters) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {!loading && crops.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {crops.map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
