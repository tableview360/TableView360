import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const MAX_PHOTOS = 10;
const UPLOAD_BUCKET = 'restaurant-uploads';

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY ??
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Faltan variables de Supabase en el servidor.',
        }),
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const formData = await request.formData();
    const slugValue = formData.get('slug');
    const slug = typeof slugValue === 'string' ? slugValue : '';
    if (!slug) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Slug de restaurante requerido.',
        }),
        { status: 400 }
      );
    }

    const files = formData
      .getAll('photos')
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Debes subir al menos 1 foto.',
        }),
        { status: 400 }
      );
    }

    if (files.length > MAX_PHOTOS) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Máximo permitido: ${MAX_PHOTOS} fotos por procesamiento.`,
        }),
        { status: 400 }
      );
    }

    const invalidFile = files.find((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Archivo inválido: ${invalidFile.name}. Solo se permiten imágenes.`,
        }),
        { status: 400 }
      );
    }
    const uploadedPaths: string[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
      const objectPath = `${slug}/originals/${Date.now()}-${i + 1}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .upload(objectPath, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });
      if (uploadError) {
        return new Response(
          JSON.stringify({ success: false, error: uploadError.message }),
          { status: 500 }
        );
      }
      uploadedPaths.push(objectPath);
    }

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        photosCount: files.length,
        bucket: UPLOAD_BUCKET,
        paths: uploadedPaths,
        message: 'Fotos subidas a Supabase Storage correctamente.',
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
            : 'No se pudieron guardar las fotos.',
      }),
      { status: 500 }
    );
  }
};
