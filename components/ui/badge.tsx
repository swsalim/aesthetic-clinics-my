import { HTMLAttributes } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'status font-regular inline-flex flex-shrink-0 items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide drop-shadow-sm',
  {
    variants: {
      variant: {
        default: 'border border-gray-300 bg-gray-200 text-gray-900',
        gray: 'border border-gray-300 bg-gray-50 text-gray-700',
        blue: 'border border-blue-300 bg-blue-50 text-blue-700',
        red: 'border border-red-300 bg-red-50 text-red-700',
        green: 'border border-green-300 bg-green-50 text-green-700',
        yellow: 'border border-yellow-300 bg-yellow-50 text-yellow-700',
        outline: 'bg-gray-50 capitalize text-gray-700',
        brand: 'border border-blue-400 bg-blue-700 text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
