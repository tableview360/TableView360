import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const GET: APIRoute = async ({ url }) => {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'Missing server environment variables: PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
        }),
        { status: 500 }
      );
    }

    const tableNameOrId = url.searchParams.get('tableId');
    const restaurantId = url.searchParams.get('restaurantId');
    const date = url.searchParams.get('date');
    const time = url.searchParams.get('time');

    if (!tableNameOrId || !restaurantId || !date || !time) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'tableId, restaurantId, date and time are required',
        }),
        { status: 400 }
      );
    }

    const reservationDate = new Date(`${date}T${time}:00`);
    if (Number.isNaN(reservationDate.getTime())) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid date/time format' }),
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .or(`name.eq.${tableNameOrId},id.eq.${tableNameOrId}`)
      .limit(1)
      .maybeSingle();

    if (tableError) {
      return new Response(
        JSON.stringify({ success: false, error: tableError.message }),
        { status: 500 }
      );
    }

    if (!table) {
      return new Response(
        JSON.stringify({ success: false, error: 'Table not found' }),
        { status: 404 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from('reservations')
      .select('id')
      .eq('table_id', table.id)
      .eq('reservation_date', reservationDate.toISOString())
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existingError) {
      return new Response(
        JSON.stringify({ success: false, error: existingError.message }),
        { status: 500 }
      );
    }

    const available = !existing;
    return new Response(
      JSON.stringify({
        success: true,
        available,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
};
