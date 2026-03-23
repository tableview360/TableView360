import type { APIRoute } from 'astro';
import { createSupabaseServerFromHeaders } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers();
  const supabase = createSupabaseServerFromHeaders(request, headers);

  await supabase.auth.signOut();

  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
};
