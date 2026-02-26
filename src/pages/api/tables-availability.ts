import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const GET: APIRoute = async ({ request }) => {
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

    const url = new URL(request.url);
    const restaurantId = url.searchParams.get('restaurantId');
    const date = url.searchParams.get('date');
    const time = url.searchParams.get('time');

    if (!restaurantId || !date || !time) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'restaurantId, date and time are required',
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
    const { data, error } = await supabase
      .from('reservations')
      .select('table_id, tables(name)')
      .eq('restaurant_id', restaurantId)
      .eq('reservation_date', reservationDate.toISOString())
      .neq('status', 'cancelled')
      .not('table_id', 'is', null);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500 }
      );
    }

    const occupiedTableIds = (data ?? [])
      .map((row) => row.table_id)
      .filter((id): id is string => typeof id === 'string');
    const occupiedTableNames = (data ?? [])
      .map((row) => {
        const tableRow = row.tables as { name?: string } | null;
        return tableRow?.name ?? null;
      })
      .filter((name): name is string => Boolean(name));

    return new Response(
      JSON.stringify({
        success: true,
        occupiedTableIds,
        occupiedTableNames,
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
