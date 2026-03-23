import type { APIRoute } from 'astro';
import { createSupabaseServerFromHeaders } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers();
  const supabase = createSupabaseServerFromHeaders(request, headers);

  const body = await request.json();
  const {
    email,
    password,
    full_name,
    username,
    phone,
    role,
    restaurant_name,
    restaurant_address,
    restaurant_capacity,
  } = body;

  if (!email || !password || !full_name || !username || !phone) {
    return new Response(
      JSON.stringify({ error: 'Todos los campos son obligatorios' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const allowedRole = role === 'restaurant' ? 'restaurant' : 'client';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: allowedRole,
      },
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = data.user?.id;
  if (userId) {
    // Update profile with extra fields
    await supabase
      .from('profiles')
      .update({
        full_name,
        username,
        phone,
      })
      .eq('id', userId);

    // If restaurant, update the auto-created restaurant with provided info
    if (allowedRole === 'restaurant' && restaurant_name) {
      await supabase
        .from('restaurants')
        .update({
          name: restaurant_name,
          address: restaurant_address || null,
          capacity: restaurant_capacity ? parseInt(restaurant_capacity) : null,
        })
        .eq('owner_id', userId);
    }
  }

  let redirectTo = '/restaurantes';
  if (allowedRole === 'restaurant') redirectTo = '/dashboard';

  headers.set('Content-Type', 'application/json');
  return new Response(
    JSON.stringify({ user: data.user, role: allowedRole, redirectTo }),
    {
      status: 200,
      headers,
    }
  );
};
