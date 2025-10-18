'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional prefix for URL inputs
   */
  prefix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefix, type = 'text', ...props }, ref) => {
    return (
      <div className="flex">
        {prefix && (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {process.env.NEXT_PUBLIC_BASE_URL}/{prefix}/
          </span>
        )}
        <input
          type={type}
          className={cn(
            'focus-visible:ring-ring flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-gray-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-500 dark:focus:ring-0 dark:focus-visible:ring-0 dark:focus-visible:ring-gray-700',
            {
              'inline-flex rounded-l-none border-l-0': prefix,
            },
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
