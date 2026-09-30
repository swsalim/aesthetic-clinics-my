'use client';

import Link from 'next/link';

import { Table } from '@tanstack/react-table';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Input } from '@/components/form-fields/input';
import { Button, buttonVariants } from '@/components/ui/button';

import { REVIEW_STATUS_OPTIONS } from '../columns';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);
  const statusColumn = table.getColumn('status');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Search author, clinic, or review..."
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[220px] lg:w-[320px]"
          aria-label="Search reviews"
        />
        {statusColumn && (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={REVIEW_STATUS_OPTIONS}
          />
        )}
        {isFiltered && (
          <Button
            variant="secondary"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
            aria-label="Reset all filters"
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/reviews/add"
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          Add New review
        </Link>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
