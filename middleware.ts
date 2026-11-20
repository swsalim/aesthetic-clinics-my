import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { STATE_SLUG_SET } from '@/config/state-slugs';

import { createMiddlewareClient } from '@/lib/supabase';

export const config = {
  // Auth is only required under /dashboard. Markdown rewrites are public.
  // /.well-known/*.md is static (the Open Knowledge Format bundle) and must not be rewritten.
  // State `?page=` redirects match only when that query is present, so a clean
  // state URL does not run middleware.
  matcher: [
    '/dashboard/:path*',
    '/((?!\\.well-known(?:/|$)).*)\\.md',
    {
      source:
        '/:state(johor|kedah|kelantan|kuala-lumpur|labuan|malacca|negeri-sembilan|pahang|penang|perak|perlis|putrajaya|sabah|sarawak|selangor|terengganu)',
      has: [{ type: 'query', key: 'page' }],
    },
    {
      source:
        '/:state(johor|kedah|kelantan|kuala-lumpur|labuan|malacca|negeri-sembilan|pahang|penang|perak|perlis|putrajaya|sabah|sarawak|selangor|terengganu)/doctors',
      has: [{ type: 'query', key: 'page' }],
    },
  ],
};

function statePageRedirect(req: NextRequest): NextResponse | null {
  const pageRaw = req.nextUrl.searchParams.get('page');
  if (!pageRaw || !/^\d+$/.test(pageRaw)) return null;

  const parts = req.nextUrl.pathname.split('/').filter(Boolean);
  const page = Number(pageRaw);
  let pathname: string | null = null;

  if (parts.length === 1 && STATE_SLUG_SET.has(parts[0])) {
    pathname = page <= 1 ? `/${parts[0]}` : `/${parts[0]}/page/${page}`;
  } else if (parts.length === 2 && parts[1] === 'doctors' && STATE_SLUG_SET.has(parts[0])) {
    pathname = page <= 1 ? `/${parts[0]}/doctors` : `/${parts[0]}/doctors/page/${page}`;
  }

  if (!pathname || pathname === req.nextUrl.pathname) return null;

  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url, 301);
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const redirected = statePageRedirect(req);
  if (redirected) return redirected;

  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/dashboard') && !pathname.endsWith('.md')) {
    return NextResponse.next();
  }

  if (pathname === '/.well-known' || pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  if (pathname.endsWith('.md')) {
    const url = req.nextUrl.clone();
    const withoutExtension = pathname.slice(0, -3);
    url.pathname =
      withoutExtension === '' || withoutExtension === '/'
        ? '/api/markdown'
        : `/api/markdown${withoutExtension}`;
    return NextResponse.rewrite(url);
  }

  const { supabase, response } = createMiddlewareClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
