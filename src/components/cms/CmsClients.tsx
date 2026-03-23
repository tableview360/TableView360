import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  created_at: string;
}

export default function CmsClients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowser();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['client', 'restaurant'])
      .order('created_at', { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Cargando...</div>;
  }

  return (
    <div>
      <p className="mb-6 text-sm text-slate-500">{clients.length} usuario(s) registrado(s)</p>

      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30 text-left text-sm text-slate-500">
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Rol</th>
              <th className="px-6 py-3 font-medium">Teléfono</th>
              <th className="px-6 py-3 font-medium">Registrado</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-slate-800 text-sm">
                <td className="px-6 py-3 font-medium text-slate-100">{c.full_name || '—'}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.role === 'restaurant' ? 'bg-violet-500/20 text-violet-400' : 'bg-indigo-500/20 text-violet-400'
                  }`}>
                    {c.role === 'restaurant' ? 'Restaurante' : 'Cliente'}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-400">{c.phone || '—'}</td>
                <td className="px-6 py-3 text-slate-400">
                  {new Date(c.created_at).toLocaleDateString('es-ES')}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
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
