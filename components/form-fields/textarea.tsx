'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import Editor from '@/components/editor';

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /**
   * Optional CSS class name to add to the textarea
   */
  className?: string;
  /**
   * Whether to use the advanced editor
   * @default false
   */
  advanced?: boolean;
  /**
   * Event handler to be called when the content changes
   */
  onChange?: (value: string) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, advanced = false, onChange, ...props }, ref) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
        if (typeof onChange !== 'function') return;

        if (typeof e === 'string') {
          // This is from the Editor component
          onChange(e);
        } else {
          // This is from the native textarea
          onChange(e.target.value);
        }
      },
      [onChange],
    );

    return (
      <>
        {!advanced && (
          <textarea
            className={cn(
              'focus-visible:ring-ring not-prose flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-gray-300 placeholder:text-gray-300 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:placeholder:text-gray-500',
              className,
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          />
        )}
        {advanced && <Editor initialContent={props.value as string} onChange={handleChange} />}
      </>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
