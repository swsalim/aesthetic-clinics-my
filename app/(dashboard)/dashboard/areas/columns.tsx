'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ClinicArea } from '@/types/clinic';
import { ColumnDef } from '@tanstack/react-table';

import { absoluteUrl } from '@/lib/utils';

import { Checkbox } from '@/components/form-fields/checkbox';

import { DataTableColumnHeader } from './components/data-table-column-header';
import { DataTableRowActions } from './components/data-table-row-actions';

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

export type AreaTableData = Partial<ClinicArea>;

export const columns: ColumnDef<AreaTableData>[] = [
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
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" className="" />,
    cell: ({ row }) => {
      return (
        <div>
          <span className="block max-w-[500px] truncate">{row.getValue('name')}</span>
          <span className="block max-w-[500px] truncate italic">{row.original.slug}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const stateName = row.getValue('name') as string;
      return stateName.toLowerCase().includes(value.toLowerCase());
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'state',
    accessorFn: (row) => row.state?.slug,
    header: ({ column }) => <DataTableColumnHeader column={column} title="State" className="" />,
    cell: ({ row }) => {
      const stateSlug = row.getValue('state') as string;
      const state = states.find((state) => state.slug === stateSlug);
      if (!state) return null;
      return <span>{state.name}</span>;
    },
    filterFn: (row, id, value) => {
      const stateSlug = row.getValue('state') as string;
      return value.includes(stateSlug);
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'clinic',
    accessorFn: (row) => row.clinics?.length,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clinics" className="" />,
    cell: ({ row }) => {
      const clinicsCount = row.getValue('clinic') as number;
      return (
        <div>
          <span>{clinicsCount || 0} clinics</span>
        </div>
      );
    },
    filterFn: (row) => {
      const clinicsCount = row.getValue('clinic') as number;
      return clinicsCount > 0;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'image',
    header: ({ column }) => <DataTableColumnHeader column={column} title="📸" className="" />,
    cell: ({ row }) => {
      const image = row.getValue('image') as string | undefined;
      return (
        <div>
          {image ? <Image unoptimized src={image} alt="Thumbnail" width={100} height={100} /> : '-'}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
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
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
