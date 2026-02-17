import { useEffect, useState } from 'react';
import { fetchReservations } from '../lib/supabaseClient';

interface Reservation {
  id: number;
  created_at: string;
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  guests?: number;
  [key: string]: unknown; // Para campos adicionales
}

const ReservationsList = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchReservations();

      setReservations(data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ Error completo:', err);
      setError(
        'Error al cargar las reservas: ' +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto py-20 px-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-violet-500" />
          <p className="mt-4 text-slate-400">Cargando reservas...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto py-20 px-6">
        <div className="text-center bg-red-900/20 border border-red-500/50 rounded-2xl p-8">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error al cargar
          </h3>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={loadReservations}
            className="mt-4 bg-gradient-to-br from-indigo-500 to-violet-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto py-20 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-transparent">
          Lista de Reservas
        </h2>
        <p className="text-lg text-slate-400">
          {reservations.length === 0
            ? 'No hay reservas en este momento'
            : `${reservations.length} reserva${reservations.length !== 1 ? 's' : ''} encontrada${reservations.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <span className="text-6xl block mb-4">📋</span>
          <p className="text-slate-400 text-lg">
            Aún no hay reservas registradas
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mostrar todos los campos de la reserva */}
                {Object.entries(reservation).map(([key, value]) => {
                  // Omitir el id y campos internos
                  if (key === 'id' || key.startsWith('_')) return null;

                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {key.includes('date') || key === 'created_at'
                          ? formatDate(value as string)
                          : value?.toString() || '-'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Indicador de hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 rounded-2xl transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      )}

      {/* Botón de refrescar */}
      <div className="text-center mt-8">
        <button
          onClick={loadReservations}
          className="bg-gradient-to-br cursor-pointer from-indigo-500 to-violet-500 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]"
        >
          🔄 Actualizar Lista
        </button>
      </div>
    </section>
  );
};

export default ReservationsList;
