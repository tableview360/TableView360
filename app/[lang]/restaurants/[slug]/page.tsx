import fs from 'node:fs';
import path from 'node:path';
import { redirect } from 'next/navigation'
import { t, langCodes, defaultLang, type LangCode } from '@/lib/i18n';
import { createSupabaseServer } from '@/lib/supabase/server'
import {
  listRestaurantPhotosFromStorage,
  RESTAURANT_PHOTO_BUCKETS,
  RESTAURANT_PRIMARY_PHOTO_BUCKET,
  resolveStoragePublicUrl,
} from '@/lib/supabase/storage';
import ReservationForm from '@/components/ReservationForm'
import Restaurant3DExperience from '@/components/three/Restaurant3DExperience';

interface RestaurantPageProps {
  params: Promise<{ slug: string; lang: string }>
}

interface RestaurantTableRow {
  id: string;
  name: string;
  capacity: number;
  chairs: number | null;
  x_position: number | null;
  y_position: number | null;
}
interface RestaurantWithModelConfig {
  name: string;
  model_3d_url?: string | null;
  three_d_model_url?: string | null;
  model_url?: string | null;
}

function slugifyModelKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeModelPath(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return value.startsWith('/') ? value : `/${value}`;
}

function findExistingPublicModelPath(candidates: string[]) {
  for (const candidate of candidates) {
    if (/^https?:\/\//i.test(candidate)) {
      return candidate;
    }

    const normalizedCandidate = candidate.startsWith('/')
      ? candidate
      : `/${candidate}`;
    const filePath = path.join(
      process.cwd(),
      'public',
      normalizedCandidate.replace(/^\/+/, ''),
    );

    if (fs.existsSync(filePath)) {
      return normalizedCandidate;
    }
  }

  return null;
}

function resolveRestaurantModelPath(
  slug: string,
  restaurant: RestaurantWithModelConfig,
) {
  const explicitModel =
    restaurant.model_3d_url ??
    restaurant.three_d_model_url ??
    restaurant.model_url ??
    null;

  if (typeof explicitModel === 'string' && explicitModel.trim()) {
    const normalizedExplicitModel = normalizeModelPath(explicitModel.trim());
    const explicitResolved = findExistingPublicModelPath([normalizedExplicitModel]);
    if (explicitResolved) {
      return explicitResolved;
    }
  }

  const slugKey = slugifyModelKey(slug);
  const nameKey = slugifyModelKey(restaurant.name);
  const normalizedNameCompact = nameKey.replace(/-/g, '');
  const isElena2026 =
    slugKey === 'elena2026' ||
    slugKey === 'elena-2026' ||
    normalizedNameCompact === 'elena2026';

  const conventionalCandidates = [
    `/models/restaurants/${slugKey}.glb`,
    `/models/restaurants/${slugKey}.gltf`,
    `/models/${slugKey}.glb`,
    `/models/${slugKey}.gltf`,
    `/models/${nameKey}.glb`,
    `/models/${nameKey}.gltf`,
    `/models/restaurant${normalizedNameCompact}.glb`,
    `/models/restaurant${normalizedNameCompact}.gltf`,
    ...(isElena2026 ? ['/models/restaurantElena2026.glb'] : []),
  ];

  return findExistingPublicModelPath(conventionalCandidates);
  return null;
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug, lang: rawLang } = await params;

  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

    const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  const role = user ? (user.app_metadata?.role ?? 'client') : null

  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (restaurantError || !restaurant) {
    redirect(`/${lang}/restaurants`);  }
  const coverUrl = resolveStoragePublicUrl(
    supabase,
    restaurant.logo_url,
    RESTAURANT_PRIMARY_PHOTO_BUCKET,
    RESTAURANT_PHOTO_BUCKETS,
  );

  const { photos } = await listRestaurantPhotosFromStorage({
    client: supabase,
    restaurantId: restaurant.id,
  });

  const { data: tableRows } = await supabase
    .from('restaurants_tables')
    .select('id, name, capacity, chairs, x_position, y_position')
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: true })

  const modelPath = resolveRestaurantModelPath(
    slug,
    restaurant as RestaurantWithModelConfig,
  );
  const initialTables = (tableRows ?? []) as RestaurantTableRow[];

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-10">
      {/* Cover */}
      <div className="aspect-[3/1] overflow-hidden rounded-2xl bg-slate-800">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-slate-500">
            🍽️
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Info */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-slate-100">{restaurant.name}</h1>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            {restaurant.city && <span>📍 {restaurant.city}</span>}
            {restaurant.address && <span>🏠 {restaurant.address}</span>}
            {restaurant.phone && <span>📞 {restaurant.phone}</span>}
            {restaurant.email && <span>✉️ {restaurant.email}</span>}
          </div>

          {restaurant.description && (
            <p className="mt-6 text-slate-400 leading-relaxed">{restaurant.description}</p>
          )}

          {/* Photos gallery */}
          {photos && photos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Fotos</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square overflow-hidden rounded-xl bg-slate-800"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reservation sidebar */}
        <div>
          {role === 'client' ? (
            <ReservationForm
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
            />
          ) : (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900 p-6 text-center text-sm text-slate-500">
              {t('reservation.only_clients', lang)}
            </div>
          )}
        </div>
      </div>

      {modelPath && (
        <div className="mt-10">
          <Restaurant3DExperience
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            modelPath={modelPath}
            initialTables={initialTables}
          />
        </div>
      )}
    </main>
  )
}