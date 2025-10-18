import { ElementType } from 'react';

import { cn } from '@/lib/utils';

export default function Prose({
  as,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: ElementType;
}) {
  const Component = as || 'div';
  return (
    <Component
      className={cn(
        className,
        'prose prose-gray max-w-none font-medium dark:prose-invert',
        // headings
        'prose-headings:relative prose-headings:scroll-mt-[6rem] prose-headings:capitalize prose-h1:mb-4 prose-h1:font-semibold prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-h3:font-medium md:prose-h2:text-2xl md:prose-h3:text-xl',
        // lead
        'prose-lead:text-gray-500',
        // 'prose-p:mt-2 prose-p:mb-2',
        // links
        'prose-a:border-b-2 prose-a:border-transparent prose-a:font-normal prose-a:text-blue-500 prose-a:no-underline prose-a:duration-200 hover:prose-a:border-blue-600 hover:prose-a:text-blue-600',
        // pre
        'prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:shadow-lg',
        'break-words',
      )}
      {...props}
    />
  );
}
