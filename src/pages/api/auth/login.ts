import type { APIRoute } from 'astro';
import { createSupabaseServerFromHeaders } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers();
  const supabase = createSupabaseServerFromHeaders(request, headers);

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email y contraseña son obligatorios' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role = profile?.role ?? 'client';
  let redirectTo = '/restaurantes';
  if (role === 'admin') redirectTo = '/cms';
  else if (role === 'restaurant') redirectTo = '/dashboard';

  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ user: data.user, role, redirectTo }), {
    status: 200,
    headers,
  });
};
