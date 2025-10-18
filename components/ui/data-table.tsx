'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  className?: string;
  getRowId?: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  caption,
  className,
  getRowId = (row: T) =>
    (row as { id?: string; name?: string }).id ||
    (row as { id?: string; name?: string }).name ||
    JSON.stringify(row),
}: DataTableProps<T>) {
  return (
    <div className={cn('rounded-md shadow ring-1 ring-black ring-opacity-5', className)}>
      <Table className="dark:bg-gray-900">
        {caption && <TableCaption className="sr-only">{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={
                  typeof column.accessorKey === 'string'
                    ? column.accessorKey.toString()
                    : column.header
                }
                className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="dark:bg-gray-900">
          {data.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((column) => (
                <TableCell
                  key={
                    typeof column.accessorKey === 'string'
                      ? column.accessorKey.toString()
                      : column.header
                  }
                  className={column.className}>
                  {column.cell
                    ? column.cell(row)
                    : typeof column.accessorKey === 'function'
                      ? column.accessorKey(row)
                      : (row[column.accessorKey] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
