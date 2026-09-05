import { NextResponse } from 'next/server';

import { deleteR2Object } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const r2_key = (body.r2_key || body.key) as string | undefined;

    if (!r2_key || typeof r2_key !== 'string') {
      return NextResponse.json({ error: 'r2_key is required' }, { status: 400 });
    }

    await deleteR2Object(r2_key);

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('R2 delete error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
