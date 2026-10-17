import { getLlmsFull, llmsTextResponse } from '@/lib/llms';

export const revalidate = 1_209_600;

export async function GET() {
  const body = await getLlmsFull();
  return llmsTextResponse(body);
}
