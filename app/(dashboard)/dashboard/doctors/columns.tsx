'use client';

import Link from 'next/link';

import { ClinicDoctor } from '@/types/clinic';
import { ColumnDef } from '@tanstack/react-table';
import { BadgeCheckIcon, MedalIcon, XCircleIcon } from 'lucide-react';

import { absoluteUrl } from '@/lib/utils';

import { Checkbox } from '@/components/form-fields/checkbox';

import { DataTableColumnHeader } from './components/data-table-column-header';
import { DataTableRowActions } from './components/data-table-row-actions';

export type DoctorTableData = Partial<ClinicDoctor>;

export const columns: ColumnDef<DoctorTableData>[] = [
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
        </div>
      );
    },
  },
  {
    accessorKey: 'clinic',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clinic" className="" />,
    cell: ({ row }) => {
      const clinics = row.original.clinics;
      return (
        <div className="flex flex-col flex-wrap gap-2">
          {clinics?.map((clinic) => (
            <Link
              key={clinic.id}
              href={absoluteUrl(`/place/${clinic.slug}`)}
              target="_blank"
              className="hover:border-none">
              {clinic.name}
            </Link>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'images',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Photo" className="" />,
    cell: ({ row }) => {
      const images = row.getValue('images') as string[] | undefined;
      return <div>{images?.length || 0}</div>;
    },
  },
  {
    accessorKey: 'is_featured',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Featured" className="" />,
    cell: ({ row }) => {
      const isFeatured = row.getValue('is_featured') as boolean;
      return (
        <div className="flex items-center">
          {isFeatured && <MedalIcon className="mr-2 h-4 w-4 text-green-500" />}
          <span>{isFeatured ? 'Yes' : 'No'}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return Array.isArray(value) && value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" className="" />,
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
