'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react';

import dynamic from 'next/dynamic';

// Dashboard-specific components that should be dynamically imported
// Note: DataTable components are imported per-page to avoid circular dependencies

export const DynamicCommand = dynamic(
  () => import('./command').then((mod) => ({ default: mod.Command })),
  {
    loading: () => <div className="h-10 animate-pulse rounded bg-gray-200" />,
    ssr: false,
  },
);

export const DynamicEditor = dynamic(() => import('../editor'), {
  loading: () => <div className="h-96 animate-pulse rounded bg-gray-200" />,
  ssr: false,
});

export const DynamicCalendar = dynamic(
  () => import('./calendar').then((mod) => ({ default: mod.Calendar })),
  {
    loading: () => <div className="h-64 animate-pulse rounded bg-gray-200" />,
    ssr: false,
  },
);

// Wrapper components for better error handling

export function DashboardCommand(props: any) {
  return (
    <Suspense fallback={<div className="h-10 animate-pulse rounded bg-gray-200" />}>
      <DynamicCommand {...props} />
    </Suspense>
  );
}

export function DashboardEditor(props: any) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded bg-gray-200" />}>
      <DynamicEditor {...props} />
    </Suspense>
  );
}

export function DashboardCalendar(props: any) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded bg-gray-200" />}>
      <DynamicCalendar {...props} />
    </Suspense>
  );
}

// Export Calendar directly for backward compatibility
export { DashboardCalendar as Calendar };

export const DynamicDashboardHeader = dynamic(() => import('./dashboard-header'), {
  loading: () => <div className="h-16 animate-pulse rounded bg-gray-200" />,
  ssr: false,
});

export function DashboardHeader(props: any) {
  return (
    <Suspense fallback={<div className="h-16 animate-pulse rounded bg-gray-200" />}>
      <DynamicDashboardHeader {...props} />
    </Suspense>
  );
}
