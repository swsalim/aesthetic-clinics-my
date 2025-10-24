'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react';

import dynamic from 'next/dynamic';

// Dynamic import for data table client (contains @tanstack/react-table)
export const DynamicDataTableClient = dynamic(
  () => import('./data-table-client').then((mod) => ({ default: mod.DataTableClient })),
  {
    loading: () => <div className="h-64 animate-pulse rounded bg-gray-200" />,
    ssr: false,
  },
);

export function DataTableClient(props: any) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded bg-gray-200" />}>
      <DynamicDataTableClient {...props} />
    </Suspense>
  );
}
