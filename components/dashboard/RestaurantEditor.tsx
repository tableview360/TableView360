'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase/client';
import { t, type LangCode } from '../../lib/i18n';
import {
  listRestaurantPhotosFromStorage,
  RESTAURANT_PHOTO_BUCKETS,
  RESTAURANT_PRIMARY_PHOTO_BUCKET,
  resolveStorageObjectPath,
  resolveStoragePublicUrl,
  uploadToFirstAvailableBucket,
} from '../../lib/supabase/storage';
import RestaurantTablesManager from './RestaurantTablesManager';

interface Props {
  lang: LangCode;
}

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  city: string;
  logo_url: string | null;
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  source?: 'table' | 'storage';
  storage_bucket?: string | null;
  storage_path?: string | null;
}

export default function RestaurantEditor({lang}:Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
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
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: rest, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (restaurantError) {
      setMessage(`Error al cargar restaurante: ${restaurantError.message}`);
      setLoading(false);
      return;
    }

    if (rest) {
      setRestaurant({
        ...rest,
        logo_url: resolveStoragePublicUrl(
          supabase,
          rest.logo_url,
          RESTAURANT_PRIMARY_PHOTO_BUCKET,
          RESTAURANT_PHOTO_BUCKETS,
        ),
      });
      setForm({
        name: rest.name || '',
        email: rest.email || '',
        phone: rest.phone || '',
        description: rest.description || '',
        address: rest.address || '',
        city: rest.city || '',
      });

      const { photos: storagePhotos, errorMessage } =
        await listRestaurantPhotosFromStorage({
          client: supabase,
          restaurantId: rest.id,
        });

      setPhotos(
        storagePhotos.map((photo) => ({
          ...photo,
          source: 'storage' as const,
        })),
      );
      if (errorMessage) {
        setMessage(`Error al cargar galería: ${errorMessage}`);
      }
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('Error: sesión no válida');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('restaurants')
      .update(form)
      .eq('id', restaurant.id)
      .eq('owner_id', user.id);

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
    setMessage('');

    const file = e.target.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${restaurant.id}/${Date.now()}.${ext}`;

    try {
      await uploadToFirstAvailableBucket({
        client: supabase,
        buckets: RESTAURANT_PHOTO_BUCKETS,
        path: filePath,
        file,
        options: {
          contentType: file.type || 'application/octet-stream',
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      setMessage(`Error al subir: ${errorMessage}`);
      setUploading(false);
      return;
    }

    setMessage('Foto subida.');

    setUploading(false);
    load();
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!restaurant || !e.target.files?.length) return;
    setUploadingCover(true);
    setMessage('');

    const file = e.target.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${restaurant.id}/cover-${Date.now()}.${ext}`;

    let uploadResult: { bucket: string; path: string; publicUrl: string };
    try {
      uploadResult = await uploadToFirstAvailableBucket({
        client: supabase,
        buckets: RESTAURANT_PHOTO_BUCKETS,
        path: filePath,
        file,
        options: {
          upsert: true,
          contentType: file.type || 'application/octet-stream',
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      setMessage(`Error al subir portada: ${errorMessage}`);
      setUploadingCover(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('Error: sesión no válida');
      setUploadingCover(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ logo_url: uploadResult.publicUrl })
      .eq('id', restaurant.id)
      .eq('owner_id', user.id);

    if (updateError) {
      await supabase.storage.from(uploadResult.bucket).remove([uploadResult.path]);
      setMessage(`Error al guardar portada: ${updateError.message}`);
      setUploadingCover(false);
      return;
    }

    setMessage('Portada actualizada');
    setUploadingCover(false);
    load();
  }

  async function handleDeletePhoto(photo: Photo) {
    if (!confirm('¿Eliminar esta foto?')) return;
    const storageObject =
      photo.storage_bucket && photo.storage_path
        ? { bucket: photo.storage_bucket, path: photo.storage_path }
        : resolveStorageObjectPath(
            photo.url,
            RESTAURANT_PRIMARY_PHOTO_BUCKET,
            RESTAURANT_PHOTO_BUCKETS,
          );

    if (!storageObject) {
      setMessage('No se pudo resolver la ruta del archivo para eliminar.');
      return;
    }

    const { error: removeError } = await supabase.storage
      .from(storageObject.bucket)
      .remove([storageObject.path]);

    if (removeError) {
      setMessage(`Error al eliminar archivo: ${removeError.message}`);
      return;
    }

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
          {t('auth.restaurant_details', lang)}
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
              {t('Your Name', lang)} *
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
                {t('auth.email', lang)}
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
                {t('auth.phone', lang)}
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              {t('auth.address', lang)}
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
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
              {t('auth.description', lang)}
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
            {saving ? t('common.saving', lang) : t('profile.save', lang)}
          </button>
        </form>
      </div>

      {/* Photo gallery */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Imagen de portada</h2>
          <p className="text-sm text-slate-400">
            Esta imagen se mostrará como portada principal del restaurante.
          </p>
        </div>

        <div className="mb-6 overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/50">
          {restaurant.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt={`${restaurant.name} portada`}
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-56 items-center justify-center text-slate-500">
              Sin portada
            </div>
          )}
        </div>

        <label
          className={`mb-2 inline-flex cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 ${
            uploadingCover ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {uploadingCover ? 'Subiendo portada...' : 'Cambiar portada'}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-700/40 bg-slate-800/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
             {t('restaurants.photos', lang)}
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
                  type="button"
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                  title="Delete"
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
            <p>{t('restaurants.no_photos', lang)}</p>
          </div>
        )}
      </div>

      <RestaurantTablesManager restaurantId={restaurant.id} />
    </div>
  );
}
