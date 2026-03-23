import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase';

interface Restaurant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  description: string | null;
  owner_id: string | null;
  created_at: string;
}

export default function CmsRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', address: '', description: '' });
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowser();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    setRestaurants(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', city: '', address: '', description: '' });
    setShowForm(true);
  }

  function openEdit(r: Restaurant) {
    setEditing(r);
    setForm({
      name: r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      city: r.city || '',
      address: r.address || '',
      description: r.description || '',
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editing) {
      await supabase.from('restaurants').update(form).eq('id', editing.id);
    } else {
      await supabase.from('restaurants').insert(form);
    }

    setSaving(false);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que quieres eliminar este restaurante?')) return;
    await supabase.from('restaurants').delete().eq('id', id);
    load();
  }

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">{restaurants.length} restaurante(s)</p>
        <button
          onClick={openCreate}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          + Nuevo Restaurante
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-slate-800/80 p-8 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? 'Editar Restaurante' : 'Nuevo Restaurante'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Nombre *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Teléfono</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Ciudad</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Dirección</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Descripción</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30 text-left text-sm text-slate-500">
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Ciudad</th>
              <th className="px-6 py-3 font-medium">Teléfono</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} className="border-b border-slate-800 text-sm">
                <td className="px-6 py-3 font-medium text-slate-100">{r.name}</td>
                <td className="px-6 py-3 text-slate-400">{r.city || '—'}</td>
                <td className="px-6 py-3 text-slate-400">{r.phone || '—'}</td>
                <td className="px-6 py-3 text-slate-400">{r.email || '—'}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)}
                      className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {restaurants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No hay restaurantes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
