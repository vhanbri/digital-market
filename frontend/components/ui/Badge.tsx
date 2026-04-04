import { ReactNode } from 'react';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-50 text-gray-600 border-gray-200',
};

const dotColors: Record<BadgeVariant, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
};

export const Badge = ({ variant = 'gray', children, dot = false }: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border
        px-3 py-1 text-xs font-medium
        ${variantStyles[variant]}
      `}
    >
      {dot && (
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};
