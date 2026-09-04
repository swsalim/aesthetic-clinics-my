import { NextResponse } from 'next/server';

import { buildR2ObjectKey, type R2Folder, uploadBufferToR2 } from '@/lib/r2';

const ALLOWED_FOLDERS: R2Folder[] = ['places', 'persons', 'location', 'static'];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folderRaw = (formData.get('folder') as string) || 'places';
    const fileName = (formData.get('fileName') as string) || file?.name || 'upload.bin';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Accept legacy ImageKit-style folder paths like "aesthetic-clinics-my/places"
    const folderSegment = folderRaw.split('/').filter(Boolean).pop() || 'places';
    const folder = (ALLOWED_FOLDERS.includes(folderSegment as R2Folder)
      ? folderSegment
      : 'places') as R2Folder;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = buildR2ObjectKey(folder, fileName, file.type);

    const result = await uploadBufferToR2({
      key,
      body: buffer,
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({
      success: true,
      r2_key: result.r2_key,
      r2_url: result.r2_url,
      // Aliases for gradual caller migration
      key: result.r2_key,
      url: result.r2_url,
      name: fileName,
      size: file.size,
    });
  } catch (error) {
    console.error('R2 upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
