import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { runPhotogrammetryPipeline } from '../../../lib/photogrammetryPipeline';

const UPLOAD_BUCKET = 'restaurant-uploads';

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    let bodySlug = '';
    if (rawBody) {
      try {
        const body = JSON.parse(rawBody) as { slug?: string };
        bodySlug = body.slug?.trim() ?? '';
      } catch {
        bodySlug = '';
      }
    }
    const requestUrl = new URL(request.url);
    let slug =
      bodySlug ||
      request.headers.get('x-restaurant-slug') ||
      requestUrl.searchParams.get('slug') ||
      '';

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'Falta SUPABASE_SERVICE_ROLE_KEY en .env. Copia la key "service_role" desde Supabase Dashboard > Settings > API > Project API keys.',
        }),
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    if (!slug) {
      const { data: topLevel, error: topLevelError } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });
      if (topLevelError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `No se pudo inferir slug automáticamente: ${topLevelError.message}`,
          }),
          { status: 500 }
        );
      }
      const inferred = topLevel?.find((item) => item.name)?.name ?? '';
      slug = inferred;
    }
    if (!slug) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'Slug de restaurante requerido y no se pudo inferir desde restaurant-uploads.',
        }),
        { status: 400 }
      );
    }
    const { modelUrl, photosCount, mode, elapsedMs } =
      await runPhotogrammetryPipeline({
        supabase,
        supabaseUrl,
        slug,
      });

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        photosCount,
        mode,
        elapsedMs,
        modelPath: `${slug}/model.glb`,
        modelUrl,
        message: 'model.glb generado desde fotogrametría (COLMAP/OpenMVS).',
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo generar automáticamente el modelo.',
      }),
      { status: 500 }
    );
  }
};
