import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase';

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  city: string;
  cover_image: string | null;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

export default function RestaurantEditor() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    address: '',
    city: '',
  });

  const supabase = createSupabaseBrowser();

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rest } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (rest) {
      setRestaurant(rest);
      setForm({
        name: rest.name || '',
        email: rest.email || '',
        phone: rest.phone || '',
        description: rest.description || '',
        address: rest.address || '',
        city: rest.city || '',
      });

      const { data: photoData } = await supabase
        .from('restaurant_photos')
        .select('*')
        .eq('restaurant_id', rest.id)
        .order('sort_order');
      setPhotos(photoData ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('restaurants')
      .update(form)
      .eq('id', restaurant.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('¡Restaurante actualizado!');
    }
    setSaving(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!restaurant || !e.target.files?.length) return;
    setUploading(true);

    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const filePath = `${restaurant.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('restaurant-photos')
      .upload(filePath, file);

    if (uploadError) {
      setMessage(`Error al subir: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('restaurant-photos').getPublicUrl(filePath);

    await supabase.from('restaurant_photos').insert({
      restaurant_id: restaurant.id,
      url: publicUrl,
      sort_order: photos.length,
    });

    setUploading(false);
    load();
  }

  async function handleDeletePhoto(photo: Photo) {
    if (!confirm('¿Eliminar esta foto?')) return;

    // Extract file path from URL
    const urlParts = photo.url.split('/restaurant-photos/');
    if (urlParts[1]) {
      await supabase.storage.from('restaurant-photos').remove([urlParts[1]]);
    }

    await supabase.from('restaurant_photos').delete().eq('id', photo.id);
    load();
  }

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Cargando...</div>;
  }

  if (!restaurant) {
    return (
      <div className="text-center py-10 text-slate-500">
        No tienes restaurante asignado
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Edit form */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Datos del restaurante
        </h2>

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.startsWith('Error')
                ? 'bg-red-500/10 text-red-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Nombre *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Teléfono
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Ciudad
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Dirección
              </label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Descripción
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Photo gallery */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Fotos del restaurante
          </h2>
          <label
            className={`cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {uploading ? 'Subiendo...' : '+ Subir foto'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-slate-700"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto'}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                  title="Eliminar"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-500">
            <p className="text-4xl mb-2">📷</p>
            <p>No hay fotos. Sube la primera.</p>
          </div>
        )}
      </div>
    </div>
  );
}
