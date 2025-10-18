'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button, buttonVariants } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function getPageNumbers(current: number, total: number) {
  const delta = 1;
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined = undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i = 0; i < range.length; i++) {
    if (l !== undefined) {
      if (range[i] - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (range[i] - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(range[i]);
    l = range[i];
  }
  return rangeWithDots;
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
  const pathname = usePathname();
  if (totalPages <= 1) return null;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className={cn('flex items-center justify-center gap-2 py-6')} aria-label="Pagination">
      {/* Desktop */}
      <div className="hidden items-center gap-2 sm:flex">
        <Button
          asChild
          variant="outline"
          disabled={currentPage === 1}
          aria-label="Previous page"
          rounded>
          <Link
            href={
              currentPage === 1
                ? '#'
                : currentPage - 1 === 1
                  ? `${pathname}`
                  : `${pathname}?page=${currentPage - 1}`
            }
            onClick={scrollToTop}
            className={cn(
              'flex items-center justify-center py-4 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-400',
              currentPage === 1 && 'pointer-events-none cursor-not-allowed opacity-50',
            )}>
            <ChevronLeftIcon className="h-5 w-5 text-blue-500 dark:text-blue-300" />
          </Link>
        </Button>
        {pageNumbers.map((page, idx) =>
          typeof page === 'number' ? (
            <Button
              key={page}
              asChild
              variant="ghost"
              rounded
              aria-current={page === currentPage ? 'page' : undefined}>
              <Link
                href={
                  page === 1
                    ? `${pathname}`
                    : page === currentPage
                      ? '#'
                      : `${pathname}?page=${page}`
                }
                onClick={scrollToTop}
                className={cn(
                  'flex size-12 items-center justify-center rounded-full py-4 font-semibold transition-colors',
                  page === currentPage
                    ? '!bg-blue-500 text-white hover:text-white dark:!bg-blue-400 dark:text-white dark:hover:text-white'
                    : 'text-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300',
                )}>
                {page}
              </Link>
            </Button>
          ) : (
            <span key={`ellipsis-${idx}`} className="select-none px-2 text-gray-400">
              ...
            </span>
          ),
        )}
        <Button
          asChild
          variant="outline"
          disabled={currentPage === totalPages}
          rounded
          aria-label="Next page">
          <Link
            href={`${pathname}?page=${currentPage + 1}`}
            onClick={scrollToTop}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex items-center justify-center rounded-full py-4 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-400',
              currentPage === totalPages && 'pointer-events-none cursor-not-allowed opacity-50',
            )}>
            <ChevronRightIcon className="h-5 w-5 text-blue-500 dark:text-blue-300" />
          </Link>
        </Button>
      </div>
      {/* Mobile */}
      <div className="flex items-center gap-2 sm:hidden">
        <Button
          asChild
          variant="outline"
          disabled={currentPage === 1}
          aria-label="Previous page"
          rounded>
          <Link
            href={`${pathname}?page=${currentPage - 1}`}
            onClick={scrollToTop}
            className={cn(
              'flex items-center justify-center rounded-full py-4 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-400',
              currentPage === 1 && 'pointer-events-none cursor-not-allowed opacity-50',
            )}>
            <ChevronLeftIcon className="h-6 w-6 text-blue-500 dark:text-blue-300" />
          </Link>
        </Button>
        <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
          {currentPage} / {totalPages}
        </span>
        <Button
          asChild
          variant="outline"
          rounded
          disabled={currentPage === totalPages}
          aria-label="Next page">
          <Link
            href={`${pathname}?page=${currentPage + 1}`}
            onClick={scrollToTop}
            className={cn(
              'flex items-center justify-center rounded-full py-4 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-400',
              currentPage === totalPages && 'pointer-events-none cursor-not-allowed opacity-50',
            )}>
            <ChevronRightIcon className="h-6 w-6 text-blue-500 dark:text-blue-300" />
          </Link>
        </Button>
      </div>
    </nav>
  );
};
