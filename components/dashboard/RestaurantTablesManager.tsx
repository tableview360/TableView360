'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface Props {
  restaurantId: string;
}

interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  chairs: number | null;
  x_position: number | null;
  y_position: number | null;
  created_at: string;
}

export default function RestaurantTablesManager({ restaurantId }: Props) {
  const supabase = createSupabaseBrowser();

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [chairs, setChairs] = useState(4);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurants_tables')

      .select('id, name, capacity, chairs, x_position, y_position, created_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true });

    if (error) {
      setMessage(`Error cargando mesas: ${error.message}`);
      setTables([]);
      setLoading(false);
      return;
    }

    setTables((data ?? []) as RestaurantTable[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  function startCreate() {
    setEditingId(null);
    setName(`Mesa ${tables.length + 1}`);
    setChairs(4);
    setXPosition(0);
    setYPosition(0);
  }

  function startEdit(table: RestaurantTable) {
    setEditingId(table.id);
    setName(table.name);
    setChairs(table.chairs ?? table.capacity);
    setXPosition(table.x_position ?? 0);
    setYPosition(table.y_position ?? 0);
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setChairs(4);
    setXPosition(0);
    setYPosition(0);
  }

  async function saveTable(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setMessage('');

    if (editingId) {
      const { error } = await supabase
        .from('restaurants_tables')
        .update({
          name: name.trim(),
          capacity: chairs,
          chairs,
          x_position: xPosition,
          y_position: yPosition,
        })
        .eq('id', editingId)
        .eq('restaurant_id', restaurantId);

      if (error) {
        setMessage(`Error actualizando mesa: ${error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('restaurants_tables').insert({
        restaurant_id: restaurantId,
        name: name.trim(),
        capacity: chairs,
        chairs,
        x_position: xPosition,
        y_position: yPosition,
      });

      if (error) {
        setMessage(`Error creando mesa: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    resetForm();
    load();
  }

  async function removeTable(id: string) {
    if (!confirm('¿Eliminar esta mesa?')) return;
    setMessage('');

    const { error } = await supabase
      .from('restaurants_tables')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurantId);

    if (error) {
      setMessage(`Error eliminando mesa: ${error.message}`);
      return;
    }

    if (editingId === id) {
      resetForm();
    }
    load();
  }

  const totalSeats = tables.reduce(
    (acc, table) => acc + (table.chairs ?? table.capacity),
    0,
  );

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Mesas</h2>
          <p className="text-sm text-slate-400">
            {tables.length} mesa(s) · {totalSeats} plazas totales
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          + Nueva mesa
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {message}
        </div>
      )}

      <form onSubmit={saveTable} className="mb-5 grid gap-3 md:grid-cols-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de mesa"
          className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          required
        />
        <input
          type="number"
          min={1}
          max={20}
          value={chairs}
          onChange={(e) => setChairs(Math.max(1, Number(e.target.value) || 1))}
          placeholder="Sillas"
          className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          required
        />
        <input
          type="number"
          value={xPosition}
          onChange={(e) => setXPosition(Number(e.target.value) || 0)}
          placeholder="X"
          className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          required
        />
        <input
          type="number"
          value={yPosition}
          onChange={(e) => setYPosition(Number(e.target.value) || 0)}
          placeholder="Y"
          className="rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/40"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="py-8 text-center text-slate-500">Cargando mesas...</div>
      ) : tables.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          No hay mesas. Crea la primera.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-700/40">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/40 text-left text-sm text-slate-500">
                <th className="px-4 py-3">Mesa</th>
                <th className="px-4 py-3">Sillas</th>
                <th className="px-4 py-3">Posición</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id} className="border-b border-slate-800 text-sm">
                  <td className="px-4 py-3 text-slate-100">{table.name}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {table.chairs ?? table.capacity}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    X: {table.x_position ?? 0} · Y: {table.y_position ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(table)}
                        className="text-violet-400 hover:text-violet-300"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTable(table.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
