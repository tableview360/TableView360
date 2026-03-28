"use client";
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase/client';

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  notes: string | null;
  restaurants: { name: string } | null;
  profiles: { username: string | null; full_name: string | null } | null;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const supabase = createSupabaseBrowser();

  async function load() {
    setLoading(true);
    let query = supabase
      .from('reservations')
      .select(
        '*, restaurants(name), profiles!reservations_client_id_fkey(username, full_name)',
      )
      .order('date', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setReservations((data ?? []) as Reservation[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('reservations').update({ status }).eq('id', id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta reserva?')) return;
    await supabase.from('reservations').delete().eq('id', id);
    load();
  }

  const statusLabel = (s: string) =>
    s === 'confirmed'
      ? 'Confirmada'
      : s === 'cancelled'
        ? 'Cancelada'
        : 'Pendiente';

  const statusClass = (s: string) =>
    s === 'confirmed'
      ? 'bg-emerald-500/20 text-emerald-400'
      : s === 'cancelled'
        ? 'bg-red-500/20 text-red-400'
        : 'bg-amber-500/20 text-amber-300';

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/40 hover:bg-slate-800/50'
            }`}
          >
            {f === 'all' ? 'Todas' : statusLabel(f)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando...</div>
      ) : (
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/30 text-left text-sm text-slate-500">
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Restaurante</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Hora</th>
                <th className="px-6 py-3 font-medium">Comensales</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b border-slate-800 text-sm">
                  <td className="px-6 py-3 text-slate-100">
                    {r.profiles?.username || r.profiles?.full_name || '—'}
                  </td>
                  <td className="px-6 py-3 text-slate-400">
                    {r.restaurants?.name || '—'}
                  </td>
                  <td className="px-6 py-3 text-slate-400">{r.date}</td>
                  <td className="px-6 py-3 text-slate-400">{r.time}</td>
                  <td className="px-6 py-3 text-slate-400">{r.guests}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(r.status)}`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(r.id, 'confirmed')}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                        >
                          Confirmar
                        </button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(r.id, 'cancelled')}
                          className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No hay reservas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
