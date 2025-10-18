'use client';

import Link from 'next/link';

import { Clinic } from '@/types/clinic';
import { ColumnDef } from '@tanstack/react-table';
import { BadgeCheckIcon, XCircleIcon } from 'lucide-react';

import { absoluteUrl } from '@/lib/utils';

import { Checkbox } from '@/components/form-fields/checkbox';

import { DataTableColumnHeader } from './components/data-table-column-header';
import { DataTableRowActions } from './components/data-table-row-actions';

export type ClinicTableData = Partial<Clinic>;

interface State {
  name: string;
  slug: string;
}

const states: State[] = [
  { name: 'Johor', slug: 'johor' },
  { name: 'Kedah', slug: 'kedah' },
  { name: 'Kelantan', slug: 'kelantan' },
  { name: 'Malacca', slug: 'malacca' },
  { name: 'Negeri Sembilan', slug: 'negeri-sembilan' },
  { name: 'Pahang State', slug: 'pahang-state' },
  { name: 'Penang', slug: 'penang' },
  { name: 'Perak', slug: 'perak' },
  { name: 'Perlis', slug: 'perlis' },
  { name: 'Sabah', slug: 'sabah' },
  { name: 'Sarawak', slug: 'sarawak' },
  { name: 'Selangor', slug: 'selangor' },
  { name: 'Terengganu', slug: 'terengganu' },
  { name: 'Kuala Lumpur', slug: 'kuala-lumpur' },
  { name: 'Labuan', slug: 'labuan' },
  { name: 'Putrajaya', slug: 'putrajaya' },
];

export const columns: ColumnDef<ClinicTableData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'id',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="ID" className="" />,
  //   cell: ({ row }) => {
  //     return (
  //       <div>
  //         <span className="block max-w-[500px] truncate">{row.getValue('id')}</span>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" className="dark:text-gray-100" />
    ),
    cell: ({ row }) => {
      const slug = row.original.slug;
      return (
        <div>
          <span className="block max-w-[500px] truncate">{row.getValue('name')}</span>
          <span className="block max-w-[500px] truncate italic">{slug}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'images',
    header: ({ column }) => <DataTableColumnHeader column={column} title="📸" className="" />,
    cell: ({ row }) => {
      const images = row.getValue('images') as
        | Array<{ image_url: string; imagekit_file_id: string }>
        | undefined;
      return <div>{images?.length || 0}</div>;
    },
  },
  {
    id: 'state',
    accessorFn: (row) => row.state?.slug,
    header: ({ column }) => <DataTableColumnHeader column={column} title="🗺️" className="" />,
    cell: ({ row }) => {
      const stateSlug = row.getValue('state') as string;
      const state = states.find((state) => state.slug === stateSlug);
      const areaName = row.original.area?.name as string;
      if (!state) return null;
      return (
        <div>
          <span>
            {state.name}
            {areaName ? `, ${areaName}` : ''}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const stateSlug = row.getValue('state') as string;
      return value.includes(stateSlug);
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="🚥" className="" />,
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <div className="flex items-center">
          {isActive ? (
            <BadgeCheckIcon className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>{isActive ? 'Active' : 'Not Active'}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    id: 'preview',
    header: ({ column }) => <DataTableColumnHeader column={column} title="🌍" className="" />,
    cell: ({ row }) => (
      <div>
        <div className="flex gap-4">
          <Link href={absoluteUrl(`/place/${row.original.slug}`)} target="_blank">
            Dev
          </Link>
          <Link
            href={`https://www.aestheticclinics.my/place/${row.original.slug}`}
            target="_blank"
            className="ml-4">
            Prod
          </Link>
        </div>
        {row.original.website && (
          <div className="mt-2">
            <Link href={row.original.website} target="_blank">
              External
            </Link>
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
