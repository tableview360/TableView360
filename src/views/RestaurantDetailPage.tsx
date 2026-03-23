import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabaseClient';
import PhotoCaptureGuide from '../components/PhotoCaptureGuide';
import TableMarkerEditor from '../components/TableMarkerEditor';

const RestaurantScene = lazy(() => import('../components/RestaurantScene'));
const SUPABASE_PUBLIC_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const MODEL_BUCKET = 'restaurant-models';
const UPLOAD_BUCKET = 'restaurant-uploads';
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

interface RestaurantDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}
interface ProcessLog {
  status: 'success' | 'error';
  message: string;
  mode?: 'full-openmvs' | 'fallback-colmap-dense';
  elapsedMs?: number;
  photosCount?: number;
  modelUrl?: string;
}

const RestaurantDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getLocalizedPath } = useLanguage();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [reservationDate, setReservationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reservationTime, setReservationTime] = useState('20:00');
  const [reservationPeople, setReservationPeople] = useState(2);
  const [occupiedTables, setOccupiedTables] = useState<string[]>([]);
  const [isLoadingTablesAvailability, setIsLoadingTablesAvailability] =
    useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [tableAvailability, setTableAvailability] = useState<
    'idle' | 'loading' | 'available' | 'occupied' | 'error'
  >('idle');
  const [reservationFeedback, setReservationFeedback] = useState<string | null>(
    null
  );
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelStatusMessage, setModelStatusMessage] = useState<string | null>(
    null
  );
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [pipelineHealth, setPipelineHealth] = useState<string | null>(null);
  const [isProcessingModel, setIsProcessingModel] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [lastProcessLog, setLastProcessLog] = useState<ProcessLog | null>(null);
  const [showCaptureGuide, setShowCaptureGuide] = useState(true);
  const [isEditingTables, setIsEditingTables] = useState(false);

  useEffect(() => {
    const syncAuthUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser ?? null);
    };
    syncAuthUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!slug) {
        setError('Slug de restaurante inválido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('restaurants')
        .select('id,name,slug,description,address,phone,email,created_at')
        .eq('slug', slug)
        .maybeSingle();

      if (queryError) {
        setError(queryError.message);
        setRestaurant(null);
      } else if (!data) {
        setError('Restaurante no encontrado');
      } else {
        setRestaurant(data);
      }

      setLoading(false);
    };

    loadRestaurant();
  }, [slug]);

  useEffect(() => {
    const loadPipelineHealth = async () => {
      try {
        const response = await fetch('/api/restaurants/pipeline-health');
        const payload = (await response.json()) as {
          success: boolean;
          ready: boolean;
          message: string;
          missing: string[];
        };
        if (!response.ok || !payload.success) {
          setPipelineHealth('No se pudo comprobar el pipeline.');
          return;
        }
        setPipelineHealth(
          payload.ready
            ? 'Pipeline fotogrametría: listo'
            : `Pipeline fotogrametría: faltan ${payload.missing.join(', ')}`
        );
      } catch {
        setPipelineHealth('No se pudo comprobar el pipeline.');
      }
    };
    loadPipelineHealth();
  }, []);

  useEffect(() => {
    const checkModel = async () => {
      if (!slug) return;
      try {
        const { data, error: listError } = await supabase.storage
          .from(MODEL_BUCKET)
          .list(slug, { search: 'model.glb', limit: 1 });
        if (listError) {
          setModelAvailable(false);
          setModelUrl(null);
          setModelStatusMessage(listError.message);
          return;
        }
        const exists = Boolean(
          data?.some(
            (item) => item.name && item.name.toLowerCase() === 'model.glb'
          )
        );
        const url = `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${MODEL_BUCKET}/${encodeURIComponent(slug)}/model.glb`;
        setModelAvailable(exists);
        setModelUrl(exists ? `${url}?t=${Date.now()}` : null);
        setModelStatusMessage(
          exists
            ? 'Modelo disponible.'
            : 'Aún no hay modelo para este restaurante.'
        );
      } catch {
        setModelAvailable(false);
        setModelUrl(null);
        setModelStatusMessage('No se pudo consultar el estado del modelo 3D.');
      }
    };

    checkModel();
  }, [slug]);

  useEffect(() => {
    const loadOccupiedTables = async () => {
      if (!restaurant?.id || !reservationDate || !reservationTime) {
        setOccupiedTables([]);
        return;
      }
      setIsLoadingTablesAvailability(true);
      try {
        const params = new URLSearchParams({
          restaurantId: restaurant.id,
          date: reservationDate,
          time: reservationTime,
        });
        const response = await fetch(
          `/api/tables-availability?${params.toString()}`
        );
        const payload = (await response.json()) as {
          success: boolean;
          occupiedTableNames?: string[];
        };
        if (!response.ok || !payload.success) {
          setOccupiedTables([]);
          return;
        }
        setOccupiedTables(payload.occupiedTableNames ?? []);
      } catch {
        setOccupiedTables([]);
      } finally {
        setIsLoadingTablesAvailability(false);
      }
    };
    loadOccupiedTables();
  }, [restaurant?.id, reservationDate, reservationTime, availabilityVersion]);

  useEffect(() => {
    if (!selectedTable) {
      setTableAvailability('idle');
      return;
    }
    if (isLoadingTablesAvailability) {
      setTableAvailability('loading');
      return;
    }
    setTableAvailability(
      occupiedTables.includes(selectedTable) ? 'occupied' : 'available'
    );
  }, [selectedTable, occupiedTables, isLoadingTablesAvailability]);

  const handleReserveTable = async () => {
    if (!selectedTable || !restaurant?.id) {
      setReservationFeedback('Selecciona una mesa primero.');
      return;
    }
    if (!user) {
      setReservationFeedback('Debes iniciar sesión para reservar.');
      return;
    }
    if (tableAvailability !== 'available') {
      setReservationFeedback('La mesa no está libre para esa fecha y hora.');
      return;
    }

    setReservationFeedback('Procesando reserva...');
    try {
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTable,
          restaurantId: restaurant.id,
          date: reservationDate,
          time: reservationTime,
          people: reservationPeople,
          clientId: user.id,
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !payload.success) {
        setReservationFeedback(
          payload.error ?? 'No se pudo completar la reserva.'
        );
        return;
      }
      setReservationFeedback('✅ Reserva creada correctamente.');
      setIsReserveModalOpen(false);
      setAvailabilityVersion((value) => value + 1);
      setTableAvailability('occupied');
    } catch {
      setReservationFeedback('Error de red al reservar.');
    }
  };

  const handleReserveNowClick = () => {
    if (!selectedTable) {
      setReservationFeedback('Selecciona una mesa primero.');
      return;
    }
    if (tableAvailability !== 'available') {
      setReservationFeedback('Esta mesa está ocupada.');
      return;
    }
    setReservationFeedback(null);
    setIsReserveModalOpen(true);
  };

  const handlePhotosUpload = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!slug || uploadingPhotos) return;

    const form = event.currentTarget;
    const input = form.elements.namedItem('photos') as HTMLInputElement | null;
    const files = Array.from(input?.files ?? []);

    if (files.length === 0) {
      setUploadFeedback('Selecciona al menos una foto.');
      return;
    }
    if (files.length > 10) {
      setUploadFeedback('Máximo permitido: 10 fotos.');
      return;
    }
    const invalidMime = files.find(
      (file) =>
        file.type && !ALLOWED_UPLOAD_MIME_TYPES.has(file.type.toLowerCase())
    );
    if (invalidMime) {
      setUploadFeedback(
        `Formato no permitido (${invalidMime.type || 'desconocido'}). Usa JPG, PNG, WEBP o HEIC.`
      );
      return;
    }

    try {
      setUploadingPhotos(true);
      setUploadFeedback(null);
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const ext = file.name.includes('.')
          ? file.name.split('.').pop()?.toLowerCase()
          : 'jpg';
        const contentType = (file.type || 'image/jpeg').toLowerCase();
        const path = `${slug}/originals/${Date.now()}-${i + 1}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(UPLOAD_BUCKET)
          .upload(path, file, {
            contentType,
            upsert: true,
          });
        if (uploadError) {
          setUploadFeedback(
            `${uploadError.message}. Revisa el bucket "${UPLOAD_BUCKET}" (MIME permitido y tamaño máximo).`
          );
          return;
        }
      }

      setProcessingStep('Procesando con fotogrametría...');

      const processResponse = await fetch('/api/restaurants/process-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const processPayload = (await processResponse.json()) as {
        success: boolean;
        error?: string;
        message?: string;
        modelUrl?: string;
        mode?: 'full-openmvs' | 'fallback-colmap-dense';
        elapsedMs?: number;
        photosCount?: number;
      };
      if (!processResponse.ok || !processPayload.success) {
        const errorMessage = `Fotos subidas, pero falló generación: ${processPayload.error ?? 'Error desconocido'}`;
        setUploadFeedback(errorMessage);
        setLastProcessLog({ status: 'error', message: errorMessage });
        return;
      }

      setUploadFeedback(
        processPayload.message ?? 'Fotos subidas y model.glb generado.'
      );
      form.reset();
      const modelPath =
        processPayload.modelUrl ??
        `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${MODEL_BUCKET}/${encodeURIComponent(slug)}/model.glb`;
      setModelAvailable(true);
      setModelUrl(`${modelPath}?t=${Date.now()}`);
      setModelStatusMessage('Modelo disponible.');
      setLastProcessLog({
        status: 'success',
        message: processPayload.message ?? 'Modelo 3D generado correctamente.',
        mode: processPayload.mode,
        elapsedMs: processPayload.elapsedMs,
        photosCount: processPayload.photosCount,
        modelUrl: processPayload.modelUrl,
      });
    } catch {
      const errorMessage = 'Error de red al subir fotos.';
      setUploadFeedback(errorMessage);
      setLastProcessLog({ status: 'error', message: errorMessage });
    } finally {
      setUploadingPhotos(false);
      setIsProcessingModel(false);
      setProcessingStep(null);
    }
  };

  const handleReprocessModel = async () => {
    if (!slug || isProcessingModel || uploadingPhotos) return;
    try {
      setIsProcessingModel(true);
      setUploadFeedback(null);

      setProcessingStep('Iniciando reprocesado...');
      setTimeout(
        () => setProcessingStep('Extrayendo features (COLMAP)...'),
        700
      );
      setTimeout(
        () => setProcessingStep('Reconstruyendo y exportando GLB...'),
        2500
      );

      const processResponse = await fetch('/api/restaurants/process-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const processPayload = (await processResponse.json()) as {
        success: boolean;
        error?: string;
        message?: string;
        modelUrl?: string;
        mode?: 'full-openmvs' | 'fallback-colmap-dense';
        elapsedMs?: number;
        photosCount?: number;
      };
      if (!processResponse.ok || !processPayload.success) {
        const errorMessage = `Falló reprocesado: ${processPayload.error ?? 'Error desconocido'}`;
        setUploadFeedback(errorMessage);
        setLastProcessLog({ status: 'error', message: errorMessage });
        return;
      }

      setUploadFeedback(
        processPayload.message ?? 'model.glb reprocesado correctamente.'
      );
      const modelPath =
        processPayload.modelUrl ??
        `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${MODEL_BUCKET}/${encodeURIComponent(slug)}/model.glb`;
      setModelAvailable(true);
      setModelUrl(`${modelPath}?t=${Date.now()}`);
      setModelStatusMessage('Modelo disponible.');
      setLastProcessLog({
        status: 'success',
        message:
          processPayload.message ?? 'model.glb reprocesado correctamente.',
        mode: processPayload.mode,
        elapsedMs: processPayload.elapsedMs,
        photosCount: processPayload.photosCount,
        modelUrl: processPayload.modelUrl,
      });
    } catch {
      const errorMessage = 'Error de red al reprocesar.';
      setUploadFeedback(errorMessage);
      setLastProcessLog({ status: 'error', message: errorMessage });
    } finally {
      setIsProcessingModel(false);
      setProcessingStep(null);
    }
  };

  const handleSaveTablePositions = async (
    tables: Array<{
      id: string;
      name: string;
      position: [number, number, number];
      capacity: number;
    }>
  ) => {
    try {
      const response = await fetch('/api/restaurants/save-table-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant?.id, tables }),
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (result.success) {
        setIsEditingTables(false);
        setUploadFeedback('Layout de mesas guardado correctamente');
      } else {
        setUploadFeedback(result.error || 'Error guardando layout');
      }
    } catch {
      setUploadFeedback('Error de red al guardar layout');
    }
  };

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-6">
        <p className="text-slate-400">Cargando restaurante...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-6 space-y-4">
        <p className="text-red-300">{error}</p>
        <Link
          to={getLocalizedPath('/restaurants')}
          className="text-violet-300 no-underline hover:text-violet-200"
        >
          ← Volver a restaurantes
        </Link>
      </section>
    );
  }

  if (!restaurant) return null;

  return (
    <section className="max-w-4xl mx-auto py-12 px-6 space-y-5">
      <Link
        to={getLocalizedPath('/restaurants')}
        className="text-violet-300 no-underline hover:text-violet-200"
      >
        ← Volver a restaurantes
      </Link>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6">
        <h1 className="text-3xl font-bold text-slate-100">{restaurant.name}</h1>
        <p className="text-slate-400 mt-1">slug: {restaurant.slug}</p>

        <div className="mt-5 space-y-2 text-slate-200">
          <p>{restaurant.description || 'Sin descripción'}</p>
          <p>Dirección: {restaurant.address || 'No disponible'}</p>
          <p>Teléfono: {restaurant.phone || 'No disponible'}</p>
          <p>Email: {restaurant.email || 'No disponible'}</p>
        </div>
      </div>

      {lastProcessLog && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Último proceso
          </h3>
          <p
            className={`text-sm ${lastProcessLog.status === 'success' ? 'text-emerald-300' : 'text-amber-300'}`}
          >
            {lastProcessLog.message}
          </p>
          <div className="text-xs text-slate-400 space-y-1">
            {lastProcessLog.mode && <p>Modo: {lastProcessLog.mode}</p>}
            {typeof lastProcessLog.photosCount === 'number' && (
              <p>Fotos procesadas: {lastProcessLog.photosCount}</p>
            )}
            {typeof lastProcessLog.elapsedMs === 'number' && (
              <p>Duración: {(lastProcessLog.elapsedMs / 1000).toFixed(1)}s</p>
            )}
            {lastProcessLog.modelUrl && (
              <p>
                Modelo:{' '}
                <a
                  href={lastProcessLog.modelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300 hover:text-violet-200"
                >
                  abrir GLB
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">
          Generar modelo 3D
        </h2>

        <p className="text-slate-300 text-sm">
          <strong className="text-slate-200">Fotogrametría:</strong> Reconstruye
          el espacio 3D desde múltiples fotos (mínimo 8). Sube fotos desde
          diferentes ángulos con buena iluminación.
        </p>

        {showCaptureGuide ? (
          <PhotoCaptureGuide
            compact
            onDismiss={() => setShowCaptureGuide(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowCaptureGuide(true)}
            className="text-sm text-violet-400 hover:text-violet-300 underline"
          >
            Ver guía de captura
          </button>
        )}

        <form onSubmit={handlePhotosUpload} className="space-y-3">
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600/90 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-violet-500"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={uploadingPhotos || isProcessingModel}
              className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {uploadingPhotos ? 'Subiendo...' : 'Subir fotos'}
            </button>
            <button
              type="button"
              onClick={() => handleReprocessModel()}
              disabled={isProcessingModel || uploadingPhotos}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-60"
            >
              {isProcessingModel ? 'Procesando...' : 'Regenerar modelo'}
            </button>
          </div>
        </form>
        {uploadFeedback && (
          <p className="text-sm text-slate-300">{uploadFeedback}</p>
        )}
        {processingStep && (
          <div className="flex items-center gap-2 text-violet-300 border-t border-slate-700/50 pt-3">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs">{processingStep}</span>
          </div>
        )}
        {pipelineHealth && (
          <p className="text-xs text-slate-400 border-t border-slate-700/50 pt-3">
            {pipelineHealth}
          </p>
        )}
      </div>

      {modelAvailable === null && (
        <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900/60 grid place-items-center text-slate-400">
          Comprobando modelo 3D...
        </div>
      )}

      {modelAvailable === false && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
          Aún no hay modelo para este restaurante. {modelStatusMessage ?? ''}
        </div>
      )}

      {modelAvailable && modelUrl && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">
              {isEditingTables ? 'Editor de mesas' : 'Vista 3D del restaurante'}
            </h2>
            <div className="flex gap-2">
              {isEditingTables ? (
                <button
                  type="button"
                  onClick={() => setIsEditingTables(false)}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
                >
                  Salir del editor
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTables(true)}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                >
                  Editar mesas
                </button>
              )}
            </div>
          </div>

          {isEditingTables ? (
            <div
              key="table-editor"
              className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900/60"
            >
              <TableMarkerEditor
                modelUrl={modelUrl}
                restaurantId={restaurant.id}
                onSave={handleSaveTablePositions}
              />
            </div>
          ) : (
            <Suspense
              key="restaurant-scene"
              fallback={
                <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900/60 grid place-items-center text-slate-400">
                  Cargando escena 3D...
                </div>
              }
            >
              <RestaurantScene
                onTableClick={(tableName) => setSelectedTable(tableName)}
                onReserveNow={handleReserveNowClick}
                modelUrl={modelUrl}
                selectedTable={selectedTable}
                occupiedTables={occupiedTables}
              />
            </Suspense>
          )}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 text-slate-200">
            Mesa seleccionada:{' '}
            <span className="font-semibold text-violet-300">
              {selectedTable ?? 'ninguna'}
            </span>
            <span className="ml-3 text-sm text-slate-300">
              {tableAvailability === 'loading' && 'Comprobando...'}
              {tableAvailability === 'available' && 'Libre ✅'}
              {tableAvailability === 'occupied' && 'Ocupada ❌'}
            </span>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 text-sm text-slate-300">
            Haz click en una mesa en el 3D. Si está libre, verás el botón
            <span className="mx-1 font-semibold text-violet-300">
              Reservar ahora
            </span>
            dentro de la escena.
          </div>
          {reservationFeedback && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 text-sm text-slate-300">
              {reservationFeedback}
            </div>
          )}
        </>
      )}
      {isReserveModalOpen && (
        <div className="fixed inset-0 z-[1200] grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">
              Reservar {selectedTable}
            </h3>
            <div className="grid gap-3">
              <label className="text-sm space-y-1">
                <span className="text-slate-300">Fecha</span>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-100"
                />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-slate-300">Hora</span>
                <input
                  type="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-100"
                />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-slate-300">Personas</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={reservationPeople}
                  onChange={(e) => setReservationPeople(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-100"
                />
              </label>
            </div>
            {!user && (
              <p className="text-sm text-amber-300">
                Debes iniciar sesión para reservar con tu perfil.
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReserveModalOpen(false)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReserveTable}
                disabled={!user || tableAvailability !== 'available'}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
              >
                Confirmar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RestaurantDetailPage;
