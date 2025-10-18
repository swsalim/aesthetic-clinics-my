'use client';

import Link from 'next/link';

import { Row } from '@tanstack/react-table';
import { PencilIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';

import { AreaTableData } from '../columns';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends AreaTableData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const area = row.original;

  return (
    <>
      <Link
        className={cn(buttonVariants({ variant: 'outline' }))}
        href={`/dashboard/areas/edit/${area.id}`}>
        <PencilIcon className="mr-2 h-4 w-4" />
        Edit
      </Link>
    </>
  );
}
