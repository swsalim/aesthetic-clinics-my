import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createMiddlewareClient } from '@/lib/supabase';

export const config = {
  // Auth is only required under /dashboard; avoid running edge middleware on public pages.
  matcher: ['/dashboard/:path*'],
};

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { supabase, response } = createMiddlewareClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Auth condition not met, redirect to login page
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
