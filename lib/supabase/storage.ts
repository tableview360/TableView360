import type { SupabaseClient } from '@supabase/supabase-js';

const STORAGE_PUBLIC_MARKER = '/storage/v1/object/public/';

export const AVATAR_BUCKET = 'client-avatars';
export const RESTAURANT_PHOTO_BUCKETS = [
  'restaurant-uploads',
  'restaurant-photos',
] as const;
export const RESTAURANT_PRIMARY_PHOTO_BUCKET = RESTAURANT_PHOTO_BUCKETS[0];

export type StorageUploadOptions = {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
};

export interface ResolvedStorageObject {
  bucket: string;
  path: string;
}

export interface RestaurantStoragePhoto {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  storage_bucket: string;
  storage_path: string;
}

function uniqueBuckets(primaryBucket: string, fallbackBuckets: readonly string[]) {
  return [primaryBucket, ...fallbackBuckets].filter(
    (bucket, index, buckets) =>
      bucket.length > 0 && buckets.indexOf(bucket) === index,
  );
}

function stripQueryAndHash(value: string) {
  return value.split(/[?#]/, 1)[0];
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseStoragePublicUrl(value: string): ResolvedStorageObject | null {
  try {
    const parsed = new URL(value);
    const markerIndex = parsed.pathname.indexOf(STORAGE_PUBLIC_MARKER);
    if (markerIndex === -1) return null;

    const objectRef = parsed.pathname
      .slice(markerIndex + STORAGE_PUBLIC_MARKER.length)
      .replace(/^\/+/, '');
    const [bucket, ...pathParts] = objectRef.split('/');
    if (!bucket || pathParts.length === 0) return null;

    return {
      bucket: safeDecode(bucket),
      path: safeDecode(pathParts.join('/')),
    };
  } catch {
    return null;
  }
}

export function resolveStorageObjectPath(
  value: string | null | undefined,
  primaryBucket: string,
  fallbackBuckets: readonly string[] = [],
): ResolvedStorageObject | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const parsedPublicUrl = parseStoragePublicUrl(trimmed);
  if (parsedPublicUrl) return parsedPublicUrl;

  if (/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const normalized = stripQueryAndHash(trimmed).replace(/^\/+/, '');
  if (!normalized) return null;

  const bucketCandidates = uniqueBuckets(primaryBucket, fallbackBuckets);
  for (const bucket of bucketCandidates) {
    if (!normalized.startsWith(`${bucket}/`)) continue;
    const rawPath = normalized.slice(bucket.length + 1);
    if (!rawPath) return null;
    return { bucket, path: safeDecode(rawPath) };
  }

  return { bucket: primaryBucket, path: safeDecode(normalized) };
}

export function resolveStoragePublicUrl(
  client: SupabaseClient,
  value: string | null | undefined,
  primaryBucket: string,
  fallbackBuckets: readonly string[] = [],
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    const parsedPublicUrl = parseStoragePublicUrl(trimmed);
    if (!parsedPublicUrl) return trimmed;

    const {
      data: { publicUrl },
    } = client.storage.from(parsedPublicUrl.bucket).getPublicUrl(parsedPublicUrl.path);
    return publicUrl;
  }

  const storageObject = resolveStorageObjectPath(
    trimmed,
    primaryBucket,
    fallbackBuckets,
  );

  if (!storageObject) return null;

  const {
    data: { publicUrl },
  } = client.storage.from(storageObject.bucket).getPublicUrl(storageObject.path);

  return publicUrl;
}

export async function uploadToFirstAvailableBucket({
  client,
  buckets,
  path,
  file,
  options,
}: {
  client: SupabaseClient;
  buckets: readonly string[];
  path: string;
  file: File;
  options?: StorageUploadOptions;
}) {
  const bucketCandidates = [...new Set(buckets.filter(Boolean))];
  if (bucketCandidates.length === 0) {
    throw new Error('No storage buckets configured.');
  }

  let lastErrorMessage = 'Upload failed.';

  for (const bucket of bucketCandidates) {
    const { error } = await client.storage.from(bucket).upload(path, file, options);
    if (!error) {
      const {
        data: { publicUrl },
      } = client.storage.from(bucket).getPublicUrl(path);

      return { bucket, path, publicUrl };
    }

    lastErrorMessage = error.message;
  }

  throw new Error(lastErrorMessage);
}

export function isSupabaseRelationMissing(
  error: { code?: string; message?: string } | null | undefined,
  relation: string,
) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;

  const normalizedMessage = (error.message ?? '').toLowerCase();
  const normalizedRelation = relation.toLowerCase();

  return (
    normalizedMessage.includes(
      `could not find the table 'public.${normalizedRelation}'`,
    ) ||
    normalizedMessage.includes(
      `could not find the relation 'public.${normalizedRelation}'`,
    ) ||
    normalizedMessage.includes(
      `relation \"public.${normalizedRelation}\" does not exist`,
    ) ||
    normalizedMessage.includes(
      `relation \"${normalizedRelation}\" does not exist`,
    )
  );
}

export async function listRestaurantPhotosFromStorage({
  client,
  restaurantId,
  buckets = RESTAURANT_PHOTO_BUCKETS,
  excludeCover = true,
}: {
  client: SupabaseClient;
  restaurantId: string;
  buckets?: readonly string[];
  excludeCover?: boolean;
}) {
  const bucketCandidates = [...new Set(buckets.filter(Boolean))];
  const photos: RestaurantStoragePhoto[] = [];
  let sortOrder = 0;
  let lastErrorMessage: string | null = null;

  for (const bucket of bucketCandidates) {
    const { data, error } = await client.storage.from(bucket).list(restaurantId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      lastErrorMessage = error.message;
      continue;
    }

    for (const entry of data ?? []) {
      const fileName = typeof entry.name === 'string' ? entry.name : '';
      if (!fileName || fileName.endsWith('/')) continue;
      if (excludeCover && fileName.startsWith('cover-')) continue;

      const storagePath = `${restaurantId}/${fileName}`;
      const {
        data: { publicUrl },
      } = client.storage.from(bucket).getPublicUrl(storagePath);

      photos.push({
        id: `${bucket}:${storagePath}`,
        url: publicUrl,
        caption: null,
        sort_order: sortOrder,
        storage_bucket: bucket,
        storage_path: storagePath,
      });
      sortOrder += 1;
    }
  }

  return {
    photos,
    errorMessage: photos.length === 0 ? lastErrorMessage : null,
  };
}
