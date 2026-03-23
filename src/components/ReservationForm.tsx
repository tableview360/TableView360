import { useState } from 'react';
import { createSupabaseBrowser } from '../lib/supabase';

interface Props {
  restaurantId: string;
  restaurantName: string;
}

export default function ReservationForm({
  restaurantId,
  restaurantName,
}: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Debes iniciar sesión');
        return;
      }

      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          restaurant_id: restaurantId,
          client_id: user.id,
          date,
          time,
          guests,
          notes: notes || null,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess(
        `¡Reserva creada en ${restaurantName}! Te confirmaremos pronto.`
      );
      setDate('');
      setTime('');
      setGuests(2);
      setNotes('');
    } catch {
      setError('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        Hacer una reserva
      </h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-slate-300"
            >
              Fecha
            </label>
            <input
              id="date"
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-slate-300"
            >
              Hora
            </label>
            <input
              id="time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="guests"
            className="block text-sm font-medium text-slate-300"
          >
            Comensales
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'persona' : 'personas'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-slate-300"
          >
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            placeholder="Alergias, celebraciones, etc."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? 'Reservando...' : 'Reservar'}
        </button>
      </form>
    </div>
  );
}
