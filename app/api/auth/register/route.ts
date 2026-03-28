import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

type RegisterPayload = {
  email?: string;
  password?: string;
  full_name?: string;
  username?: string;
  phone?: string;
  role?: 'client' | 'restaurant' | 'admin';
  restaurant_name?: string;
  restaurant_address?: string;
  restaurant_capacity?: string | number;
  lang?: 'en' | 'es';
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RegisterPayload;
  const {
    email,
    password,
    full_name,
    username,
    phone,
    role = 'client',
    restaurant_name,
    restaurant_address,
    restaurant_capacity,
    lang,
  } = body;

  if (!email || !password || !full_name || !username || !phone) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }

  if (role === 'restaurant' && !restaurant_name?.trim()) {
    return NextResponse.json(
      { error: 'Restaurant name is required' },
      { status: 400 },
    );
  }

  const safeLang = lang === 'es' ? 'es' : 'en';
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name,
        username,
        phone,
        restaurant_name: role === 'restaurant' ? restaurant_name : null,
        restaurant_address: role === 'restaurant' ? restaurant_address : null,
        restaurant_capacity: role === 'restaurant' ? restaurant_capacity : null,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;

  if (userId) {
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        full_name,
        username,
        phone,
        role,
      },
      { onConflict: 'id' },
    );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (role === 'restaurant') {
      const { data: existingRestaurant, error: existingRestaurantError } =
        await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', userId)
          .maybeSingle();

      if (existingRestaurantError) {
        return NextResponse.json(
          { error: existingRestaurantError.message },
          { status: 400 },
        );
      }

      if (!existingRestaurant) {
        const baseSlug = slugify(
          restaurant_name?.trim() || username || full_name || 'restaurant',
        );

        let finalSlug = baseSlug || `restaurant-${userId.slice(0, 8)}`;
        let suffix = 2;

        while (true) {
          const { data: slugMatch, error: slugError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', finalSlug)
            .maybeSingle();

          if (slugError) {
            return NextResponse.json({ error: slugError.message }, { status: 400 });
          }

          if (!slugMatch) break;
          finalSlug = `${baseSlug || 'restaurant'}-${suffix}`;
          suffix += 1;
        }

        const { error: restaurantError } = await supabase.from('restaurants').insert({
          owner_id: userId,
          name: restaurant_name?.trim(),
          slug: finalSlug,
          address: restaurant_address?.trim() || null,
          email,
          phone,
        });

        if (restaurantError) {
          return NextResponse.json(
            { error: restaurantError.message },
            { status: 400 },
          );
        }
      }
    }
  }

  const localizedLogin = safeLang === 'es' ? '/es/login' : '/login';
  const localizedRestaurants =
    safeLang === 'es' ? '/es/restaurants' : '/restaurants';
  const localizedDashboard = safeLang === 'es' ? '/es/dashboard' : '/dashboard';

  const redirectTo = data.session
    ? role === 'restaurant' || role === 'admin'
      ? localizedDashboard
      : localizedRestaurants
    : localizedLogin;
  return NextResponse.json({ redirectTo });
}
