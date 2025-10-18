'use client';

import { Table } from '@tanstack/react-table';
import { XIcon } from 'lucide-react';

import { Input } from '@/components/form-fields/input';
import { Button } from '@/components/ui/button';

import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface State {
  name: string;
  slug: string;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  states: State[];
}

export function DataTableToolbar<TData>({ table, states }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const nameColumn = table.getColumn('name');
  const stateColumn = table.getColumn('state');

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {nameColumn && (
          <Input
            placeholder="Filter business..."
            value={(nameColumn.getFilterValue() as string) ?? ''}
            onChange={(event) => nameColumn.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
            aria-label="Filter businesses by name"
          />
        )}

        {stateColumn && (
          <DataTableFacetedFilter column={stateColumn} title="States" options={states} />
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
      <DataTableViewOptions table={table} />
    </div>
  );
}
