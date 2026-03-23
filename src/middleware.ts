import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerFromHeaders } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, locals, rewrite } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // --- i18n: detect /es/ prefix ---
  // Check if this is a rewritten request (lang was set in a previous pass)
  const cookieLang = request.headers
    .get('cookie')
    ?.match(/tv360_lang=(es|en)/)?.[1];
  let lang: 'en' | 'es' = 'en'; // English is the default

  if (path.startsWith('/es/') || path === '/es') {
    lang = 'es';
    const basePath = path.replace(/^\/es/, '') || '/';
    locals.lang = lang;
    // Set a cookie so the rewritten request knows the lang
    const rewriteRequest = new Request(
      new URL(basePath + url.search, url.origin),
      request
    );
    rewriteRequest.headers.set(
      'cookie',
      (request.headers.get('cookie') || '') + '; tv360_lang=es'
    );
    return rewrite(rewriteRequest);
  }

  // After rewrite, read lang from cookie
  if (cookieLang === 'es') {
    lang = 'es';
  }
  locals.lang = lang;

  // Skip auth check for public routes and API
  const isPublic =
    path === '/' ||
    path === '/login' ||
    path === '/registro' ||
    path.startsWith('/api/') ||
    path.startsWith('/_') ||
    /\.(css|js|svg|ico|png|jpg|jpeg|webp|woff2?)$/.test(path);

  if (isPublic) {
    return next();
  }

  const headers = new Headers();
  const supabase = createSupabaseServerFromHeaders(request, headers);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → redirect to home with login modal flag
  if (!user) {
    return redirect('/?login=true');
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'client';

  locals.user = user;
  locals.role = role;

  // CMS routes → admin only
  if (path.startsWith('/cms') && role !== 'admin') {
    return redirect('/');
  }

  // Dashboard routes → restaurant owner only
  if (path.startsWith('/dashboard') && role !== 'restaurant') {
    return redirect('/');
  }

  const response = await next();

  // Forward auth cookies
  headers.forEach((value, key) => {
    response.headers.append(key, value);
  });

  return response;
});
