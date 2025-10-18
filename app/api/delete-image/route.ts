import { NextResponse } from 'next/server';

import { generateSHA1, generateSignature } from '@/lib/utils';

// Environment variables validation
const apiName = process.env.NEXT_PUBLIC_CLOUDIARY_API_NAME;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const apiKey = process.env.CLOUDINARY_API_KEY;

if (!apiName || !apiSecret || !apiKey) {
  throw new Error('Missing required Cloudinary environment variables');
}

// Type assertion after validation
const validatedApiSecret = apiSecret as string;

interface DeleteImageRequest {
  public_id: string;
}

interface CloudinaryResponse {
  result: string;
  error?: {
    message: string;
  };
}

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${apiName}/image/destroy`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Input validation
    if (!body || typeof body.public_id !== 'string' || !body.public_id.trim()) {
      return NextResponse.json(
        { error: 'Invalid request: public_id is required' },
        { status: 400 },
      );
    }

    const { public_id } = body as DeleteImageRequest;
    const timestamp = new Date().getTime();
    const signature = generateSHA1(generateSignature(public_id, validatedApiSecret));

    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        public_id,
        signature,
        timestamp,
      }),
    });

    const data = (await response.json()) as CloudinaryResponse;

    if (data.result === 'ok') {
      return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });
    }

    return NextResponse.json(
      { error: data.error?.message || 'Failed to delete image' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error deleting image:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
