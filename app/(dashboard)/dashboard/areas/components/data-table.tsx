import type { ColumnDef } from '@tanstack/react-table';

import { createServerClient } from '@/lib/supabase';

import { DataTableClient } from './data-table-client';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export async function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const supabase = await createServerClient();
  const { data: states, error } = await supabase
    .from('states')
    .select('slug, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching states:', error);
    return null;
  }

  return (
    <DataTableClient
      columns={columns}
      data={data}
      states={states.map((state) => ({
        name: state.name,
        slug: state.slug,
      }))}
    />
  );
}
