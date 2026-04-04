import dynamic from 'next/dynamic';
import Head from 'next/head';
import { MainLayout } from '../layouts/MainLayout';

const MarketplaceContent = dynamic(
  () => import('../components/marketplace/MarketplaceContent'),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="mt-1 text-gray-500">Loading produce…</p>
        </div>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </div>
    ),
  },
);

export default function MarketplacePage() {
  return (
    <>
      <Head>
        <title>Marketplace - AniKo</title>
      </Head>
      <MainLayout>
        <MarketplaceContent />
      </MainLayout>
    </>
  );
}
