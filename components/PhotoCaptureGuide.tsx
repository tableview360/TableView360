export interface PhotoCaptureGuideProps {
  onDismiss?: () => void;
  compact?: boolean;
}

const CameraIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ImageIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const FileIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const LightIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const CircleIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const LayersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

const HeightIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
);

const TableIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-green-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-5 h-5"
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
);

const WalkingPatternDiagram = () => (
  <div className="bg-slate-900/50 rounded-lg p-4 mt-4">
    <p className="text-xs text-slate-400 mb-3 text-center">
      Patrón de caminata recomendado
    </p>
    <div className="flex justify-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px] h-auto">
        {/* Restaurant floor */}
        <rect
          x="50"
          y="30"
          width="100"
          height="60"
          rx="4"
          fill="#334155"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Tables */}
        <rect
          x="65"
          y="45"
          width="20"
          height="15"
          rx="2"
          fill="#1e293b"
          stroke="#64748b"
          strokeWidth="0.5"
        />
        <rect
          x="115"
          y="45"
          width="20"
          height="15"
          rx="2"
          fill="#1e293b"
          stroke="#64748b"
          strokeWidth="0.5"
        />
        <rect
          x="90"
          y="65"
          width="20"
          height="15"
          rx="2"
          fill="#1e293b"
          stroke="#64748b"
          strokeWidth="0.5"
        />

        {/* Walking path (dashed circle) */}
        <ellipse
          cx="100"
          cy="60"
          rx="70"
          ry="45"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        {/* Camera positions */}
        <circle cx="30" cy="60" r="4" fill="#a78bfa" />
        <circle cx="50" cy="25" r="4" fill="#a78bfa" />
        <circle cx="100" cy="12" r="4" fill="#a78bfa" />
        <circle cx="150" cy="25" r="4" fill="#a78bfa" />
        <circle cx="170" cy="60" r="4" fill="#a78bfa" />
        <circle cx="150" cy="95" r="4" fill="#a78bfa" />
        <circle cx="100" cy="108" r="4" fill="#a78bfa" />
        <circle cx="50" cy="95" r="4" fill="#a78bfa" />

        {/* Direction arrow */}
        <path
          d="M35 45 L40 50 L35 55"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Labels */}
        <text x="100" y="55" textAnchor="middle" fill="#94a3b8" fontSize="8">
          Mesas
        </text>
      </svg>
    </div>
    <div className="flex justify-center gap-4 mt-3 text-xs text-slate-400">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-violet-400"></span>
        Posición de foto
      </span>
      <span className="flex items-center gap-1">
        <span
          className="w-4 h-0.5 bg-violet-500"
          style={{ borderStyle: 'dashed' }}
        ></span>
        Ruta circular
      </span>
    </div>
  </div>
);

export default function PhotoCaptureGuide({
  onDismiss,
  compact = false,
}: PhotoCaptureGuideProps) {
  if (compact) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-300 flex-wrap">
            <span className="flex items-center gap-2">
              <CameraIcon />
              <span>15-30 fotos</span>
            </span>
            <span className="flex items-center gap-2">
              <ImageIcon />
              <span>1080p mín.</span>
            </span>
            <span className="flex items-center gap-2">
              <CircleIcon />
              <span>Caminar en círculo</span>
            </span>
            <span className="flex items-center gap-2">
              <LayersIcon />
              <span>70% superposición</span>
            </span>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
              aria-label="Cerrar guía"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CameraIcon />
            Cómo tomar fotos para el modelo 3D
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Sigue estas instrucciones para obtener el mejor resultado
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            aria-label="Cerrar guía"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-violet-400 mb-3">
          Requisitos mínimos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-slate-900/40 rounded-lg px-4 py-3">
            <div className="text-violet-400">
              <CameraIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-white">15-30 fotos</p>
              <p className="text-xs text-slate-400">Mínimo requerido</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/40 rounded-lg px-4 py-3">
            <div className="text-violet-400">
              <ImageIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-white">1920×1080</p>
              <p className="text-xs text-slate-400">Resolución mínima</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/40 rounded-lg px-4 py-3">
            <div className="text-violet-400">
              <FileIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-white">JPG o PNG</p>
              <p className="text-xs text-slate-400">No HEIC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-violet-400 mb-3">
          Pasos a seguir
        </h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2 text-white">
                <LightIcon />
                <span className="font-medium">Iluminación uniforme</span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Enciende todas las luces, evita sombras fuertes
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2 text-white">
                <CircleIcon />
                <span className="font-medium">Camina en círculo</span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Rodea el espacio tomando fotos cada 2-3 pasos
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2 text-white">
                <LayersIcon />
                <span className="font-medium">Superposición 70%</span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Cada foto debe compartir 70% con la anterior
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2 text-white">
                <HeightIcon />
                <span className="font-medium">Múltiples alturas</span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Toma fotos a nivel de ojos y más abajo
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-medium">
              5
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-2 text-white">
                <TableIcon />
                <span className="font-medium">Detalles de mesas</span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Acércate a cada mesa desde varios ángulos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-violet-400 mb-3">
          Tips importantes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-start gap-2">
            <CheckIcon />
            <span className="text-sm text-slate-300">
              Mantén la cámara estable (usa las dos manos)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon />
            <span className="text-sm text-slate-300">
              Evita reflejos de espejos o ventanas
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon />
            <span className="text-sm text-slate-300">
              No incluyas personas en movimiento
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckIcon />
            <span className="text-sm text-slate-300">
              Toma más fotos de las zonas con mesas
            </span>
          </div>
        </div>
      </div>

      {/* Visual diagram */}
      <WalkingPatternDiagram />
    </div>
  );
}
