import { useState } from 'react';
import { createSupabaseBrowser } from '../lib/supabase';
import { t, type LangCode } from '../lib/i18n';

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
  initialReservations: Reservation[];
  lang: LangCode;
}

const statusLabel = (s: string, lang: LangCode) => {
  if (s === 'confirmed') return t('my_reservations.confirmed', lang);
  if (s === 'cancelled') return t('my_reservations.cancelled', lang);
  return t('my_reservations.pending', lang);
};

const statusClass = (s: string) => {
  if (s === 'confirmed') return 'bg-emerald-500/20 text-emerald-400';
  if (s === 'cancelled') return 'bg-red-500/20 text-red-400';
  return 'bg-amber-500/20 text-amber-300';
};

function formatDate(r: Reservation, lang: LangCode): string {
  const raw = r.reservation_date || r.date;
  if (!raw) return '—';
  try {
    return new Date(raw).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
}

function extractDate(r: Reservation): string {
  if (r.date) return r.date;
  if (r.reservation_date) return r.reservation_date.split('T')[0];
  return '';
}

function extractTime(r: Reservation): string {
  if (r.time) return r.time.slice(0, 5); // HH:MM
  if (r.reservation_date)
    return r.reservation_date.split('T')[1]?.slice(0, 5) ?? '';
  return '';
}

export default function MisReservasList({ initialReservations, lang }: Props) {
  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations);
  const [editing, setEditing] = useState<Reservation | null>(null);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPeople, setEditPeople] = useState(2);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function openEdit(r: Reservation) {
    setEditing(r);
    setEditDate(extractDate(r));
    setEditTime(extractTime(r));
    setEditPeople(r.people ?? 2);
    setSaveError('');
  }

  function closeModal() {
    setEditing(null);
    setSaveError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveError('');

    const supabase = createSupabaseBrowser();
    const { error } = await supabase
      .from('reservations')
      .update({
        reservation_date: `${editDate}T${editTime}:00`,
        date: editDate,
        time: editTime,
        people: editPeople,
      })
      .eq('id', editing.id);

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    // Update local state
    setReservations((prev) =>
      prev.map((r) =>
        r.id === editing.id
          ? {
              ...r,
              reservation_date: `${editDate}T${editTime}:00`,
              date: editDate,
              time: editTime,
              people: editPeople,
            }
          : r
      )
    );

    setSaving(false);
    closeModal();
  }

  const today = new Date().toISOString().split('T')[0];
  const inputCls =
    'mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none';
  const labelCls = 'block text-sm font-medium text-slate-300';

  if (reservations.length === 0) {
    return (
      <div className="mt-20 text-center text-slate-500">
        <p className="text-5xl mb-4">📅</p>
        <p className="text-lg font-medium text-slate-300">
          {t('my_reservations.empty', lang)}
        </p>
        <p className="mt-2 text-sm">{t('my_reservations.empty_hint', lang)}</p>
        <a
          href="/restaurantes"
          className="mt-6 inline-block rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          {t('my_reservations.explore', lang)}
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reservations.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-slate-100">
                {r.restaurants?.name ??
                  t('my_reservations.unknown_restaurant', lang)}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-400 mt-1">
                <span>📅 {formatDate(r, lang)}</span>
                {(r.time || r.reservation_date) && (
                  <span>🕐 {extractTime(r)}</span>
                )}
                <span>
                  👥 {r.people ?? 1} persona{(r.people ?? 1) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:flex-shrink-0 flex-wrap">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(r.status)}`}
              >
                {statusLabel(r.status, lang)}
              </span>
              {r.restaurants?.id && (
                <a
                  href={`/restaurantes/${r.restaurants.id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors no-underline"
                >
                  {t('my_reservations.view', lang)}
                </a>
              )}
              {r.status !== 'cancelled' && (
                <button
                  onClick={() => openEdit(r)}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-50 transition-colors"
                >
                  {t('my_reservations.edit', lang)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  {t('my_reservations.edit_title', lang)}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {editing.restaurants?.name}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-100 transition-colors bg-transparent border-none cursor-pointer text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fecha</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Hora</label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Personas</label>
                <select
                  value={editPeople}
                  onChange={(e) => setEditPeople(Number(e.target.value))}
                  className={inputCls}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </div>

              {saveError && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                  {saveError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
