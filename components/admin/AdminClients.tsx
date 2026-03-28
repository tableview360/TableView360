"use client";
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  created_at: string;
}

export default function AdminClients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    role: 'client',
  });

  const supabase = createSupabaseBrowser();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['client', 'restaurant', 'admin'])
      .order('created_at', { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(client: Profile) {
    setEditing(client);
    setForm({
      full_name: client.full_name ?? '',
      phone: client.phone ?? '',
      role: client.role,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        role: form.role,
      })
      .eq('id', editing.id);

    setSaving(false);
    setEditing(null);
    load();
  }

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Cargando...</div>;
  }

  return (
    <div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-slate-800/90 p-8 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold">Editar usuario</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Nombre
                </label>
                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Teléfono
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Rol
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-violet-500 focus:outline-none"
                >
                  <option value="client">Cliente</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="mb-6 text-sm text-slate-500">
        {clients.length} usuario(s) registrado(s)
      </p>

      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30 text-left text-sm text-slate-500">
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Rol</th>
              <th className="px-6 py-3 font-medium">Teléfono</th>
              <th className="px-6 py-3 font-medium">Registrado</th>
              <th className="px-6 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-slate-800 text-sm">
                <td className="px-6 py-3 font-medium text-slate-100">
                  {c.full_name || '—'}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.role === 'admin'
                        ? 'bg-red-500/20 text-red-400'
                        : c.role === 'restaurant'
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-indigo-500/20 text-violet-400'
                    }`}
                  >
                    {c.role === 'admin'
                      ? 'Admin'
                      : c.role === 'restaurant'
                        ? 'Restaurante'
                        : 'Cliente'}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-400">{c.phone || '—'}</td>
                <td className="px-6 py-3 text-slate-400">
                  {new Date(c.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
