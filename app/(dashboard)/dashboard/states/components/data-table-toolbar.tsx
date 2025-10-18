'use client';

import Link from 'next/link';

import { Table } from '@tanstack/react-table';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Input } from '@/components/form-fields/input';
import { Button, buttonVariants } from '@/components/ui/button';

import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  type?: string;
}

export function DataTableToolbar<TData>({ table, type }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const nameColumn = table.getColumn('name');

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {nameColumn && (
          <Input
            placeholder="Filter state..."
            value={(nameColumn.getFilterValue() as string) ?? ''}
            onChange={(event) => nameColumn.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
            aria-label="Filter states by name"
          />
        )}

        {isFiltered && (
          <Button
            variant="secondary"
            onClick={() => table.resetColumnFilters()}
            aria-label="Reset all filters">
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Link
        href="/dashboard/states/add"
        className={cn(buttonVariants({ variant: 'secondary' }), 'mr-4')}>
        Add New <span className="ml-2 capitalize">{type}</span>
      </Link>
      <DataTableViewOptions table={table} />
    </div>
  );
}
