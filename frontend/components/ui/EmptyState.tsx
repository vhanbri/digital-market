import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) => (
  <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <Icon size={28} className="text-gray-400" />
    </div>
    <p className="mb-1 text-lg font-semibold text-gray-700">{title}</p>
    <p className="mx-auto mb-6 max-w-sm text-sm text-gray-400">{description}</p>
    {actionLabel && actionHref && (
      <Link href={actionHref}>
        <Button size="sm">{actionLabel}</Button>
      </Link>
    )}
    {actionLabel && onAction && !actionHref && (
      <Button size="sm" onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);
