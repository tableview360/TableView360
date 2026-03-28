"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '../../lib/supabase/client';
import { localePath, t, type LangCode } from '../../lib/i18n';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  logo_url: string | null;
  reservations?: { count: number }[];
}

type Tab = 'popular' | 'nearby';

function RestaurantCard({ r, lang }: { r: Restaurant; lang: LangCode }) {
  return (
    <Link
      href={localePath(`/restaurants/${r.slug}`, lang)}
      className="group block overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/80 transition hover:border-violet-500/50 hover:shadow-xl no-underline"
    >
      <div className="aspect-video bg-slate-900 overflow-hidden">
        {r.logo_url ? (
          <img
            src={r.logo_url}
            alt={r.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-600">
            🍽️
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-100 group-hover:text-violet-400 transition-colors">
          {r.name}
        </h3>
        {r.address && (
          <p className="mt-1 text-sm text-slate-500 truncate">📍 {r.address}</p>
        )}
        {r.reservations !== undefined && (
          <p className="mt-2 text-xs text-violet-400 font-medium">
            🔥 {r.reservations[0]?.count ?? 0}{' '}
            {t('home.reservations_label', lang)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function PopularRestaurants({ lang }: { lang: LangCode }) {
  const [tab, setTab] = useState<Tab>('popular');
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Nearby state
  const [locLoading, setLocLoading] = useState(false);
  const [locCity, setLocCity] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [nearbyDone, setNearbyDone] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase
      .from('restaurants')
      .select('id, name, slug, address, logo_url, reservations(count)')
      .then(({ data }) => {
        const sorted = (data ?? []).sort((a: Restaurant, b: Restaurant) => {
          const ca = a.reservations?.[0]?.count ?? 0;
          const cb = b.reservations?.[0]?.count ?? 0;
          return cb - ca;
        });
        setAllRestaurants(sorted);
        setLoading(false);
      });
  }, []);

  async function handleNearbyTab() {
    setTab('nearby');
    if (nearbyDone) return;

    setLocLoading(true);
    setLocError(null);

    if (!navigator.geolocation) {
      setLocError(t('home.location_error', lang));
      setLocLoading(false);
      setNearbyDone(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const geoData = await res.json();
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.municipality ||
            geoData.address?.county ||
            null;

          if (city) {
            setLocCity(city);
            const lower = city.toLowerCase();
            setNearbyRestaurants(
              allRestaurants.filter((r) =>
                r.address?.toLowerCase().includes(lower)
              )
            );
          } else {
            setLocError(t('home.city_not_found', lang));
          }
        } catch {
          setLocError(t('home.location_error', lang));
        }
        setLocLoading(false);
        setNearbyDone(true);
      },
      () => {
        setLocError(t('home.location_denied', lang));
        setLocLoading(false);
        setNearbyDone(true);
      },
      { timeout: 8000 }
    );
  }

  const popular = allRestaurants.slice(0, 4);

  return (
    <section className="mb-12">
      {/* Header + tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {t('home.restaurants_title', lang)}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {t('home.restaurants_subtitle', lang)}
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-700/50 bg-slate-800/60 p-1 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setTab('popular')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'popular'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t('home.popular_tab', lang)}
          </button>
          <button
            onClick={handleNearbyTab}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'nearby'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t('home.nearby_tab', lang)}
          </button>
        </div>
      </div>

      {/* Populares tab */}
      {tab === 'popular' && (
        <>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-700/30 bg-slate-800/40 aspect-[4/3] animate-pulse"
                />
              ))}
            </div>
          ) : popular.length === 0 ? (
            <p className="text-slate-500 text-sm">
              {t('home.no_restaurants', lang)}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((r) => (
                <RestaurantCard key={r.id} r={r} lang={lang} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Cerca de ti tab */}
      {tab === 'nearby' && (
        <>
          {locLoading && (
            <div className="flex items-center gap-3 py-10 text-slate-400">
              <svg
                className="w-5 h-5 animate-spin text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              {t('home.detecting_location', lang)}
            </div>
          )}

          {!locLoading && locError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
              {locError}
            </div>
          )}

          {!locLoading &&
            !locError &&
            nearbyDone &&
            nearbyRestaurants.length === 0 && (
              <div className="py-10 text-center text-slate-500">
                <p className="text-2xl mb-2">📍</p>
                <p>
                  No encontramos restaurantes en{' '}
                  <strong className="text-slate-300">{locCity}</strong> todavía.
                </p>
              </div>
            )}

          {!locLoading && nearbyRestaurants.length > 0 && (
            <>
              <p className="text-sm text-slate-400 mb-4">
                Mostrando restaurantes en{' '}
                <span className="text-violet-400 font-medium">{locCity}</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {nearbyRestaurants.slice(0, 4).map((r) => (
                  <RestaurantCard key={r.id} r={r} lang={lang} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-5 text-right">
        <Link
          href={localePath('/restaurants', lang)}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors no-underline font-medium"
        >
          Ver todos los restaurantes →
        </Link>
      </div>
    </section>
  );
}
