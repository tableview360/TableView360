import { useState, useEffect } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase';
import { t, type LangCode } from '../../lib/i18n';

interface Reservation {
  id: string;
  reservation_date?: string;
  date?: string;
  time?: string;
  people?: number;
  status: string;
  restaurants: { id: string; name: string } | null;
}

interface Props {
  userId: string;
  lang: LangCode;
}

const statusLabel = (s: string, lang: LangCode) => {
  if (s === 'confirmed') return t('my_reservations.confirmed', lang);
  if (s === 'cancelled') return t('my_reservations.cancelled', lang);
  return t('my_reservations.pending', lang);
};

const statusClass = (s: string) => {
  if (s === 'confirmed')
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
  if (s === 'cancelled') return 'bg-red-500/20 text-red-400 border-red-500/20';
  return 'bg-amber-500/20 text-amber-300 border-amber-500/20';
};

function formatDate(r: Reservation, lang: LangCode): string {
  const raw = r.reservation_date || r.date;
  if (!raw) return '—';
  try {
    return new Date(raw).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
}

function extractTime(r: Reservation): string {
  if (r.time) return r.time.slice(0, 5);
  if (r.reservation_date)
    return r.reservation_date.split('T')[1]?.slice(0, 5) ?? '';
  return '';
}

export default function RecentReservations({ userId, lang }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase
      .from('reservations')
      .select(
        'id, reservation_date, date, time, people, status, restaurants(id, name)'
      )
      .eq('client_id', userId)
      .order('reservation_date', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setReservations((data as Reservation[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {t('home.recent_title', lang)}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {t('home.recent_subtitle', lang)}
          </p>
        </div>
        <a
          href="/mis-reservas"
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors no-underline font-medium"
        >
          {t('home.see_all', lang)}
        </a>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl border border-slate-700/30 bg-slate-800/40 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && reservations.length === 0 && (
        <div className="rounded-2xl border border-slate-700/30 bg-slate-800/40 px-6 py-10 text-center">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-slate-400 text-sm">{t('home.no_recent', lang)}</p>
          <a
            href="/restaurantes"
            className="mt-3 inline-block text-sm text-violet-400 hover:text-violet-300 transition-colors no-underline font-medium"
          >
            {t('home.explore', lang)}
          </a>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/80 px-5 py-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-violet-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  🍽️
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-100 truncate">
                    {r.restaurants?.name ?? t('home.restaurant_fallback', lang)}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {formatDate(r)}
                    {extractTime(r) && <span> · {extractTime(r)}</span>}
                    {r.people && (
                      <span>
                        {' '}
                        · {r.people}{' '}
                        {r.people !== 1
                          ? t('reservation.persons', lang)
                          : t('reservation.person', lang)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass(r.status)}`}
                >
                  {statusLabel(r.status, lang)}
                </span>
                {r.restaurants?.id && (
                  <a
                    href={`/restaurantes/${r.restaurants.id}`}
                    className="hidden sm:block text-xs text-slate-500 hover:text-violet-400 transition-colors no-underline"
                  >
                    Ver →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
