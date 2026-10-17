import { getPageMarkdown, llmsTextResponse } from '@/lib/llms';

export const revalidate = 1_209_600;

export async function GET(_request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const markdown = await getPageMarkdown(slug ?? []);

  if (!markdown) {
    return llmsTextResponse('Not found', 404);
  }

  return llmsTextResponse(markdown);
}
