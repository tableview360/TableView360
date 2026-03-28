import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const hasLang = /^\/(en|es)(\/|$)/.test(pathname);

  if (!hasLang) {
    return NextResponse.rewrite(
      new URL(`/en${pathname === '/' ? '' : pathname}`, request.url),
    );
  }

  return;
}
