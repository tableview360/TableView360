import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { t, localePath, type LangCode } from '@/lib/i18n';
import PopularRestaurants from '@/components/home/PopularRestaurants';
import RecentReservations from '@/components/home/RecentReservations';

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;

  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = null;
  let username: string | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    role = profile?.role ?? null;
    username = profile?.username || profile?.full_name || null;
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex items-center justify-center px-6 pt-32 pb-16 text-center">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-50">
            {t('hero.title1', lang as LangCode)}
            <br />
            <span
              className="bg-gradient-to-r from-violet-400 via-violet-500 to-indigo-400 bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              {t('hero.title2', lang as LangCode)}
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            {t('hero.subtitle', lang as LangCode)}
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            {user ? (
              <Link
                href={localePath('/restaurantes', lang as LangCode)}
                className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500 shadow-lg shadow-violet-500/20"
              >
                {t('hero.cta_restaurants', lang as LangCode)}
              </Link>
            ) : (
              <Link
                href={localePath('/registro', lang as LangCode)}
                className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500 shadow-lg shadow-violet-500/20"
              >
                {t('hero.cta', lang as LangCode)}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Logged sections */}
      {user && (
        <div className="mx-auto w-full max-w-7xl px-6 pb-16">
          <PopularRestaurants lang={lang as LangCode} />
          <RecentReservations userId={user.id} lang={lang as LangCode} />
        </div>
      )}
    </div>
  );
}