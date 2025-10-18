import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors duration-200 ease-in-out',
  {
    variants: {
      variant: {
        primary:
          'border border-solid border-transparent bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:border-blue-600 focus:outline-none active:bg-blue-600',
        secondary:
          'border border-solid border-gray-300 bg-white text-gray-500 hover:border-gray-700 hover:text-gray-800 focus:border-gray-700 active:border-gray-700 active:bg-gray-50 active:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-400 dark:focus:border-gray-700 dark:active:border-gray-700 dark:active:bg-gray-50 dark:active:text-gray-800',
        outline:
          'border border-gray-300/50 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800/40 dark:hover:text-gray-400 dark:focus:border-gray-700 dark:active:border-gray-700 dark:active:bg-gray-50 dark:active:text-gray-800',
        ghost:
          'bg-transparent text-gray-700 hover:border-transparent hover:bg-gray-100 hover:text-gray-700 focus:border-blue-300 active:bg-gray-100 active:text-gray-700 dark:text-gray-100 dark:hover:border-transparent dark:hover:bg-gray-800 dark:hover:text-gray-100',
        danger:
          'border border-solid border-transparent bg-red-600 text-white hover:bg-red-800 hover:text-white focus:border-red-800 focus:outline-none active:bg-red-800',
      },
      size: {
        default: 'px-4 py-2',
        large: 'px-8 py-3',
        icon: 'size-9',
      },
      rounded: {
        true: 'rounded-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      rounded: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
