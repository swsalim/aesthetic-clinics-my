// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { secret, table } = await request.json();

  // Check secret (use a strong secret in production)
  if (secret !== process.env.SUPABASE_REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!table) {
    return new Response('No table name provided', { status: 400 });
  }
  if (table !== 'ratings' && table !== 'locations') {
    return new Response('Invalid table name', { status: 400 });
  }

  if (table === 'clinics') {
    revalidateTag('recent-clinics');
    revalidateTag('nearby-clinics');
    revalidateTag('clinic-reviews');
  } else if (table === 'areas') {
    revalidateTag('area-metadata-by-slug');
    revalidateTag('area-for-browse');
    revalidateTag('area-static-by-slug');
  } else if (table === 'states') {
    revalidateTag('state-metadata-by-slug');
    revalidateTag('state-for-browse');
    revalidateTag('state-static-by-slug');
  } else if (table === 'doctors') {
    revalidateTag('doctor-metadata-by-slug');
    revalidateTag('doctor-static-by-slug');
    revalidateTag('doctors-by-state-slug');
  }

  return NextResponse.json({ revalidated: true });
}
