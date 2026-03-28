import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

type LogoutPayload = {
  lang?: 'en' | 'es';
};

export async function POST(req: NextRequest) {
  let body: LogoutPayload = {};

  try {
    body = (await req.json()) as LogoutPayload;
  } catch {
    body = {};
  }

  const safeLang = body.lang === 'es' ? 'es' : 'en';
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    redirectTo: `/${safeLang}`,
  });
}

export async function GET(req: NextRequest) {
  const rawLang = req.nextUrl.searchParams.get('lang');
  const safeLang = rawLang === 'es' ? 'es' : 'en';
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(`/${safeLang}`, req.url));
}
