import Link from 'next/link';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type BreadcrumbTheme = 'light' | 'dark';

interface BreadcrumbItem {
  name?: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  theme?: BreadcrumbTheme;
  routerCallback?: () => void;
}

const styles = {
  light: {
    link: 'text-blue-500 dark:text-blue-300 hover:text-blue-600',
    text: 'text-blue-500 dark:text-blue-300',
    icon: 'text-blue-500 dark:text-blue-400',
  },
  dark: {
    link: 'text-blue-300 hover:text-blue-600',
    text: 'text-blue-300',
    icon: 'text-blue-300',
  },
} as const;

const Breadcrumb = ({ items, theme = 'light', routerCallback }: BreadcrumbProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      {routerCallback && (
        <nav className="sm:hidden" aria-label="Back">
          <Link
            href="#"
            prefetch={false}
            className={cn(
              'flex items-center text-sm font-medium transition-colors',
              styles[theme].link,
            )}
            onClick={(e) => {
              e.preventDefault();
              routerCallback();
            }}>
            <ChevronLeftIcon
              className={cn(
                'ml-1 mr-1 h-5 w-5 flex-shrink-0 transition-colors',
                styles[theme].icon,
              )}
              aria-hidden="true"
            />
            <span>Back</span>
          </Link>
        </nav>
      )}
      <nav
        className={cn(routerCallback && 'hidden sm:flex', !routerCallback && 'flex')}
        aria-label="Breadcrumb">
        <ol
          role="list"
          className="flex-no-wrap mb-2 flex w-full items-center gap-y-2 space-x-4 overflow-x-auto sm:mb-0">
          <li>
            <Link
              href="/"
              className={cn(
                'font-regular text-base capitalize drop-shadow-sm transition-colors',
                styles[theme].link,
              )}
              prefetch={false}>
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={`breadcrumb-item-${index}`} className="flex shrink-0 items-center">
              <ChevronRightIcon
                className={cn(
                  'h-5 w-5 flex-shrink-0 drop-shadow-sm transition-colors',
                  styles[theme].icon,
                )}
                aria-hidden="true"
              />
              {item.url ? (
                <Link
                  href={item.url}
                  className={cn(
                    'font-regular ml-4 text-base capitalize drop-shadow-sm transition-colors',
                    styles[theme].link,
                  )}
                  prefetch={false}>
                  {item.name}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className={cn(
                    'font-regular ml-4 text-base capitalize drop-shadow-sm transition-colors',
                    styles[theme].text,
                  )}>
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
