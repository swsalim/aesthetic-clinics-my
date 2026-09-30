'use client';

import Link from 'next/link';

import { ReviewWithClinic } from '@/types/clinic';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { absoluteUrl } from '@/lib/utils';

import { StarRating } from '@/components/ui/star-rating';

import { DataTableColumnHeader } from './components/data-table-column-header';
import { DataTableRowActions } from './components/data-table-row-actions';

export type ReviewTableData = ReviewWithClinic;

const STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  clinic_deleted: 'Clinic deleted',
  clinic_rejected: 'Clinic rejected',
};

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-800',
  rejected: 'bg-red-50 text-red-700',
  clinic_deleted: 'bg-gray-100 text-gray-600',
  clinic_rejected: 'bg-gray-100 text-gray-600',
};

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manual',
  imported: 'Imported',
  scraped: 'Scraped',
  api: 'API',
};

export const REVIEW_STATUS_OPTIONS = [
  { name: 'Approved', slug: 'approved' },
  { name: 'Pending', slug: 'pending' },
  { name: 'Rejected', slug: 'rejected' },
  { name: 'Clinic deleted', slug: 'clinic_deleted' },
  { name: 'Clinic rejected', slug: 'clinic_rejected' },
];

export const columns: ColumnDef<ReviewTableData>[] = [
  {
    accessorKey: 'author_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
    cell: ({ row }) => {
      const review = row.original;
      return (
        <div>
          <Link
            href={`/dashboard/reviews/edit/${review.id}`}
            className="block max-w-[220px] truncate font-medium"
          >
            {review.author_name}
          </Link>
          {review.email && (
            <span className="block max-w-[220px] truncate text-sm text-gray-500">
              {review.email}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: 'clinic',
    accessorFn: (row) => row.clinic?.name ?? '',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clinic" />,
    cell: ({ row }) => {
      const clinic = row.original.clinic;
      if (!clinic) return <span className="text-gray-400">—</span>;

      return (
        <Link
          href={absoluteUrl(`/place/${clinic.slug}`)}
          target="_blank"
          className="block max-w-[240px] truncate hover:underline"
        >
          {clinic.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number | null;
      if (rating == null) return <span className="text-gray-400">—</span>;
      return <StarRating rating={rating} />;
    },
  },
  {
    accessorKey: 'text',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Review" />,
    cell: ({ row }) => {
      const text = row.getValue('text') as string | null;
      if (!text) return <span className="text-gray-400">—</span>;
      return <p className="line-clamp-2 max-w-md text-sm text-gray-700">{text}</p>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = (row.getValue('status') as string | null) ?? 'pending';
      const source = row.original.source;
      return (
        <div>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
          {source && (
            <span className="mt-1 block text-xs text-gray-500">
              {SOURCE_LABELS[source] ?? source}
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'review_time',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const value = row.getValue('review_time') as string | null;
      if (!value) return <span className="text-gray-400">—</span>;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return <span className="text-gray-400">—</span>;
      return <span className="whitespace-nowrap text-sm">{format(date, 'dd MMM yyyy')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
