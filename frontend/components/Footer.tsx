import { Sprout } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-800">
              <Sprout size={14} className="text-white" />
            </span>
            <span className="font-semibold text-brand-800">Ani<span className="text-amber-500">Ko</span></span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/marketplace" className="hover:text-gray-900">
              Marketplace
            </Link>
            <Link href="#about" className="hover:text-gray-900">
              About
            </Link>
            <Link href="#contact" className="hover:text-gray-900">
              Contact
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AniKo
          </p>
        </div>
      </div>
    </footer>
  );
};
