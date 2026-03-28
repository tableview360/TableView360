// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ignorar cosas internas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  // 🔥 si NO tiene idioma → añadir default (en)
  const hasLang = /^\/(en|es)(\/|$)/.test(pathname);

  if (!hasLang) {
    return NextResponse.rewrite(
      new URL(`/en${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  return;
}