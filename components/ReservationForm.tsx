'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface Props {
  restaurantId: string;
  restaurantName: string;
}

interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  chairs: number | null;
  x_position: number | null;
  y_position: number | null;
}

export default function ReservationForm({ restaurantId, restaurantName }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(0);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [matchingTables, setMatchingTables] = useState<RestaurantTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [loadingTables, setLoadingTables] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const selectedTable = useMemo(
    () => matchingTables.find((table) => table.id === selectedTableId) ?? null,
    [matchingTables, selectedTableId],
  );

  useEffect(() => {
    async function loadTables() {
      const supabase = createSupabaseBrowser();
      setLoadingTables(true);
      const { data, error: fetchError } = await supabase
        .from('restaurants_tables')
        .select('id, name, capacity, chairs, x_position, y_position')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        setError(`Error cargando mesas: ${fetchError.message}`);
        setTables([]);
        setAvailableTables([]);
        setLoadingTables(false);
        return;
      }

      const loadedTables = (data ?? []) as RestaurantTable[];
      setError('');
      setTables(loadedTables);
      setAvailableTables(loadedTables);
      setSelectedTableId(loadedTables[0]?.id ?? '');
      setLoadingTables(false);
    }

    loadTables();
  }, [restaurantId]);

  useEffect(() => {
    async function loadAvailability() {
      if (!date || !time) {
        setAvailableTables(tables);
        return;
      }

      const supabase = createSupabaseBrowser();
      const { data, error: availabilityError } = await supabase
        .from('reservations')
        .select('table_id, status')
        .eq('restaurant_id', restaurantId)
        .eq('date', date)
        .eq('time', time)
        .in('status', ['pending', 'confirmed']);

      if (availabilityError) {
        setError(`Error comprobando disponibilidad: ${availabilityError.message}`);
        return;
      }

      const reservedTableIds = new Set(
        ((data ?? []) as Array<{ table_id: string | null }>)
          .map((reservation) => reservation.table_id)
          .filter((tableId): tableId is string => Boolean(tableId)),
      );

      const filteredTables = tables.filter((table) => !reservedTableIds.has(table.id));
      setAvailableTables(filteredTables);

      if (filteredTables.length === 0) {
        setSelectedTableId('');
        return;
      }

      if (!filteredTables.find((table) => table.id === selectedTableId)) {
        setSelectedTableId(filteredTables[0].id);
      }
    }

    loadAvailability();
  }, [date, time, restaurantId, selectedTableId, tables]);

  useEffect(() => {
    if (!guests) {
      setMatchingTables([]);
      setSelectedTableId('');
      return;
    }

    const filtered = availableTables.filter(
      (table) => (table.chairs ?? table.capacity) === guests,
    );
    setMatchingTables(filtered);

    if (filtered.length === 0) {
      setSelectedTableId('');
      if (!loadingTables) {
        setPopupMessage(
          `Lo siento, pero no hay mesa disponible para ${guests} personas.`,
        );
      }
      return;
    }

    if (!filtered.find((table) => table.id === selectedTableId)) {
      setSelectedTableId(filtered[0].id);
    }
  }, [availableTables, guests, loadingTables, selectedTableId]);

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
        setLoading(false);
        return;
      }

      if (!guests) {
        setError('Selecciona cuántas personas van a venir');
        setLoading(false);
        return;
      }

      if (matchingTables.length === 0 || !selectedTableId) {
        setError(`No hay mesa disponible para ${guests} personas`);
        setLoading(false);
        return;
      }
      if (!selectedTable) {
        setError('Selecciona una mesa válida');
        setLoading(false);
        return;
      }
      if ((selectedTable.chairs ?? selectedTable.capacity) !== guests) {
        setError(`Debes seleccionar una mesa para exactamente ${guests} personas`);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          restaurant_id: restaurantId,
          client_id: user.id,
          reservation_date: `${date}T${time}:00`,
          date,
          time,
          people: guests,
          table_id: selectedTableId || null,
        });

      if (insertError) {
        if (
          insertError.message.includes('table_id') ||
          insertError.message.includes('restaurants_tables') ||
          insertError.message.includes('restaurant_tables')
        ) {
          setError(
            'Falta la migración de mesas en Supabase (restaurants_tables y reservations.table_id).',
          );
        } else {
          setError(insertError.message);
        }
      } else {
        setSuccess(`¡Reserva creada en ${restaurantName}! Te confirmaremos pronto.`);
        setDate('');
        setTime('');
        setGuests(0);
      }
    } catch {
      setError('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  }

  const guestsOptions = Array.from(
    new Set(tables.map((table) => table.chairs ?? table.capacity).filter((v) => v > 0)),
  ).sort((a, b) => a - b);

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-900 p-6 shadow-sm text-slate-100">
      <h3 className="text-lg font-semibold mb-4">Hacer una reserva</h3>

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
            <label htmlFor="date" className="block text-sm font-medium">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium">
              Hora
            </label>
            <input
              type="time"
              id="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            />
          </div>
        </div>


        <div>
          <label htmlFor="guests" className="block text-sm font-medium">
            Comensales
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            required
          >
            <option value={0}>Selecciona cuántas personas</option>
            {guestsOptions.map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'persona' : 'personas'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="table" className="block text-sm font-medium">
            Mesa
          </label>
          <select
            id="table"
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            disabled={loadingTables || !guests || matchingTables.length === 0}
            required
          >
            {loadingTables ? (
              <option value="">Cargando mesas...</option>
            ) : !guests ? (
              <option value="">Primero selecciona comensales</option>
            ) : matchingTables.length === 0 ? (
              <option value="">No hay mesa disponible para {guests} personas</option>
            ) : (
              matchingTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} · {(table.chairs ?? table.capacity)} sillas · X:{' '}
                  {table.x_position ?? 0} · Y: {table.y_position ?? 0}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Disponibles para {guests || 0} personas: {matchingTables.length}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !guests || matchingTables.length === 0}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-white disabled:opacity-50"
        >
          {loading ? 'Reservando...' : 'Reservar'}
        </button>
      </form>

      {popupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-2xl">
            <h4 className="mb-2 text-lg font-semibold text-slate-100">Sin disponibilidad</h4>
            <p className="mb-4 text-sm text-slate-300">{popupMessage}</p>
            <button
              type="button"
              onClick={() => setPopupMessage('')}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
