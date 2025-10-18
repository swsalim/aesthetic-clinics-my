import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const font = fetch(new URL('../../../assets/fonts/CalSans-SemiBold.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer(),
);

export async function GET(req: NextRequest) {
  try {
    const fontData = await font;
    const { searchParams } = new URL(req.url);

    // ?title=<title>&image=<image_url>
    const hasTitle = searchParams.has('title');
    const title = hasTitle ? searchParams.get('title')?.slice(0, 100) : 'My default title';

    const hasImage = searchParams.has('image');
    const imageUrl = hasImage ? searchParams.get('image') : null;

    let imageData: string;

    if (imageUrl) {
      try {
        // Fetch the provided image
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          imageData = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
        } else {
          throw new Error('Failed to fetch provided image');
        }
      } catch (error) {
        console.log('Failed to fetch provided image, falling back to default:', error);
        // Fall back to default image
        imageData = await fetch(
          new URL('../../../assets/images/og-background.jpeg', import.meta.url),
        )
          .then((res) => res.arrayBuffer())
          .then((buf) => `data:image/jpeg;base64,${Buffer.from(buf).toString('base64')}`);
      }
    } else {
      // Use default image
      imageData = await fetch(new URL('../../../assets/images/og-background.jpeg', import.meta.url))
        .then((res) => res.arrayBuffer())
        .then((buf) => `data:image/jpeg;base64,${Buffer.from(buf).toString('base64')}`);
    }

    return new ImageResponse(
      (
        <div tw="flex relative w-[1200px] h-[630px]">
          <div
            tw="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${imageData})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}></div>
          <div tw="absolute inset-0 bg-black/10 z-10"></div>
          <div tw="relative z-20 flex items-end justify-end h-full">
            <div tw="flex flex-col items-start justify-end bg-black/70 w-full p-5">
              <h1 tw="text-6xl text-gray-100 font-bold text-left mb-0">{title}</h1>
              <p tw="text-red-500 font-semibold capitalize tracking-wide mt-4 text-2xl text-left">
                aestheticclinics.my
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Cal Sans',
            data: fontData,
            style: 'normal',
          },
        ],
      },
    );
  } catch (e: unknown) {
    console.log(e instanceof Error ? e.message : String(e));
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
