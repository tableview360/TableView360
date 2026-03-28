import { createSupabaseServer } from '@/lib/supabase/server';
import { t, langCodes, defaultLang, type LangCode } from '@/lib/i18n';
import Link from 'next/link';

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function RestaurantsPage({ params }: Props) {
  const { lang: rawLang } = await params; // ✅ correcto

  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  const supabase = await createSupabaseServer();

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, slug, description, address, logo_url, phone')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[restaurants] error:', error.message);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-10">
      <h1 className="text-3xl font-bold text-slate-100">
        {t('restaurants.title', lang)}
      </h1>

      <p className="mt-2 text-slate-500">
        {t('restaurants.subtitle', lang)}
      </p>

      {restaurants && restaurants.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/${lang}/restaurants/${r.slug}`} // <--- importante
              className="group block overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/90 shadow-sm transition hover:shadow-xl"
            >
              <div className="aspect-video bg-slate-800">
                {r.logo_url ? (
                  <img
                    src={r.logo_url}
                    alt={r.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl text-slate-500">
                    🍽️
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-violet-400">
                  {r.name}
                </h3>

                {r.address && (
                  <p className="mt-1 text-sm text-slate-500">
                    📍 {r.address}
                  </p>
                )}

                {r.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {r.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center text-slate-500">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-lg">
            {t('restaurants.empty', lang)}
          </p>
        </div>
      )}
    </div>
  );
}