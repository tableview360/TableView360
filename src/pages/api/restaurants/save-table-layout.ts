import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

interface TableLayout {
  id: string;
  name: string;
  position: [number, number, number];
  capacity: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      restaurantId?: string;
      tables?: TableLayout[];
    };
    const { restaurantId, tables } = body;

    if (!restaurantId || !tables) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'restaurantId y tables son requeridos',
        }),
        { status: 400 }
      );
    }

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración de Supabase incompleta',
        }),
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Eliminar layout existente
    await supabase
      .from('table_layouts')
      .delete()
      .eq('restaurant_id', restaurantId);

    // Insertar nuevas mesas
    if (tables.length > 0) {
      const records = tables.map((table) => ({
        restaurant_id: restaurantId,
        table_name: table.name,
        position_x: table.position[0],
        position_y: table.position[1],
        position_z: table.position[2],
        capacity: table.capacity,
      }));

      const { error: insertError } = await supabase
        .from('table_layouts')
        .insert(records);

      if (insertError) {
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${tables.length} mesas guardadas`,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const restaurantId = url.searchParams.get('restaurantId');

    if (!restaurantId) {
      return new Response(
        JSON.stringify({ success: false, error: 'restaurantId es requerido' }),
        { status: 400 }
      );
    }

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración de Supabase incompleta',
        }),
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from('table_layouts')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500 }
      );
    }

    // Transformar los datos al formato esperado por el frontend
    const tables: TableLayout[] = (data || []).map((record) => ({
      id: record.id,
      name: record.table_name,
      position: [record.position_x, record.position_y, record.position_z] as [
        number,
        number,
        number,
      ],
      capacity: record.capacity,
    }));

    return new Response(JSON.stringify({ success: true, tables }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      { status: 500 }
    );
  }
};
