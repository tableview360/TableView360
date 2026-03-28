import { redirect } from 'next/navigation'
import { t, langCodes, defaultLang, type LangCode } from '@/lib/i18n';
import { createSupabaseServer } from '@/lib/supabase/server'
import ReservationForm from '@/components/ReservationForm'

interface RestaurantPageProps {
  params: Promise<{ slug: string; lang: string }>
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

  const { data: photos } = await supabase
    .from('restaurant_photos')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order')

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-10">
      {/* Cover */}
      <div className="aspect-[3/1] overflow-hidden rounded-2xl bg-slate-800">
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
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
    </main>
  )
}