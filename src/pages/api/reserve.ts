import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

interface ReservePayload {
  tableId?: string;
  date?: string;
  time?: string;
  people?: number;
  clientId?: string;
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const POST: APIRoute = async ({ request }) => {
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

    const body = (await request.json()) as ReservePayload;
    const { tableId, date, time, people = 2, clientId } = body;

    if (!tableId || !date || !time) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'tableId, date and time are required',
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
      .select('id, restaurant_id, name')
      .or(`name.eq.${tableId},id.eq.${tableId}`)
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

    if (existing) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Table is already reserved for that date/time',
        }),
        { status: 409 }
      );
    }

    const payload: Record<string, unknown> = {
      table_id: table.id,
      restaurant_id: table.restaurant_id,
      reservation_date: reservationDate.toISOString(),
      date,
      time,
      people,
      status: 'pending',
    };

    if (clientId) {
      payload.client_id = clientId;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('reservations')
      .insert(payload)
      .select('id, table_id, reservation_date, date, time, status')
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        reservation: inserted,
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
