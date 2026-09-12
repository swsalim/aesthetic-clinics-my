import { NextResponse } from 'next/server';

// Remove edge runtime - it has limitations with Buffer and file handling
// export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'clinicgeek';
    const fileName = (formData.get('fileName') as string) || file?.name;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create form data for ImageKit - Use native FormData
    const imagekitFormData = new globalThis.FormData();

    // Convert buffer to Blob for proper FormData handling
    const blob = new Blob([buffer], { type: file.type });
    imagekitFormData.append('file', blob, fileName);
    imagekitFormData.append('fileName', fileName);
    imagekitFormData.append('folder', folder);

    // Optional: Add other ImageKit parameters
    imagekitFormData.append('useUniqueFileName', 'true');

    // Use private key for authentication
    const auth = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        // Don't set Content-Type - let the browser set it with boundary for FormData
      },
      body: imagekitFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImageKit upload error:', errorText);

      // Try to parse as JSON, fallback to text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        {
          error: 'Failed to upload image',
          details: errorData,
        },
        { status: response.status },
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      imagekit_file_id: result.fileId,
      url: result.url,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl,
      size: result.size,
    });
  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 },
    );
  }
}
