import type { APIRoute } from 'astro';

export const prerender = false;

import {
  getRestaurantModelUrl,
  hasModelGlb,
  readModelStatus,
} from '../../../lib/restaurantModelStorage';
const getStatusBySlug = async (slug: string) => {
  const [modelReady, status] = await Promise.all([
    hasModelGlb(slug),
    readModelStatus(slug),
  ]);

  const fallbackStatus = status ?? {
    status: modelReady ? 'done' : 'idle',
    message: modelReady
      ? 'Modelo disponible.'
      : 'Aún no hay modelo para este restaurante.',
    updatedAt: new Date().toISOString(),
  };

  return new Response(
    JSON.stringify({
      success: true,
      slug,
      modelReady,
      modelUrl: modelReady ? getRestaurantModelUrl(slug) : null,
      status: fallbackStatus,
    }),
    { status: 200 }
  );
};

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get('slug') ?? '';
  if (!slug) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Slug de restaurante requerido.',
      }),
      { status: 400 }
    );
  }

  try {
    return await getStatusBySlug(slug);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo consultar el modelo.',
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    let bodySlug = '';
    if (rawBody) {
      const parsed = JSON.parse(rawBody) as { slug?: string };
      bodySlug = parsed.slug?.trim() ?? '';
    }
    const requestUrl = new URL(request.url);
    const slug =
      bodySlug ||
      request.headers.get('x-restaurant-slug') ||
      requestUrl.searchParams.get('slug') ||
      '';
    if (!slug) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Slug de restaurante requerido.',
        }),
        { status: 400 }
      );
    }

    return await getStatusBySlug(slug);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo consultar el modelo.',
      }),
      { status: 500 }
    );
  }
};
