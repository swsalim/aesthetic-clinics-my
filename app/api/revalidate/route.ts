// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Verify the request is from Supabase (use a secret token)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_REVALIDATE_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { table } = await request.json();

  if (!table) {
    return new Response('No table name provided', { status: 400 });
  }
  if (!['clinics', 'areas', 'states', 'doctors'].includes(table)) {
    return new Response('Invalid table name', { status: 400 });
  }

  if (table === 'clinics') {
    revalidateTag('clinics');
  } else if (table === 'areas') {
    revalidateTag('areas');
  } else if (table === 'states') {
    revalidateTag('states');
    revalidateTag('popular-states');
  } else if (table === 'doctors') {
    revalidateTag('doctors');
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
