/* eslint-disable react/no-unknown-property */
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

export interface TablePosition {
  id: string;
  name: string;
  position: [number, number, number];
  capacity: number;
}

interface TableMarkerEditorProps {
  modelUrl: string;
  restaurantId: string;
  onSave: (tables: TablePosition[]) => void;
}

interface AddTableDialogProps {
  position: [number, number, number];
  onConfirm: (name: string, capacity: number) => void;
  onCancel: () => void;
  tableCount: number;
}

function AddTableDialog({
  position,
  onConfirm,
  onCancel,
  tableCount,
}: AddTableDialogProps) {
  const [name, setName] = useState(`Mesa ${tableCount + 1}`);
  const [capacity, setCapacity] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), capacity);
    }
  };

  return (
    <Html position={position} center>
      <div className="rounded-xl border border-slate-600/80 bg-slate-900/95 backdrop-blur-sm p-4 shadow-2xl min-w-[220px]">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">
          Nueva Mesa
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="tableName"
              className="block text-xs text-slate-400 mb-1"
            >
              Nombre
            </label>
            <input
              id="tableName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Ej: Mesa 1"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="tableCapacity"
              className="block text-xs text-slate-400 mb-1"
            >
              Capacidad (personas)
            </label>
            <input
              id="tableCapacity"
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) =>
                setCapacity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              Añadir
            </button>
          </div>
        </form>
      </div>
    </Html>
  );
}

interface TableMarkerProps {
  table: TablePosition;
  isSelected: boolean;
  onClick: () => void;
}

function TableMarker({ table, isSelected, onClick }: TableMarkerProps) {
  return (
    <group position={table.position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#a78bfa' : '#22c55e'}
          transparent
          opacity={0.7}
          emissive={isSelected ? '#8b5cf6' : '#16a34a'}
          emissiveIntensity={0.3}
        />
      </mesh>
      <Html position={[0, 0.5, 0]} center>
        <div
          className={`rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap ${
            isSelected
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800/90 text-slate-200 border border-slate-600'
          }`}
        >
          {table.name}
        </div>
      </Html>
    </group>
  );
}

interface ModelWithRaycastProps {
  modelUrl: string;
  tables: TablePosition[];
  selectedTableId: string | null;
  pendingPosition: [number, number, number] | null;
  onModelClick: (point: THREE.Vector3) => void;
  onTableSelect: (id: string) => void;
  onConfirmTable: (name: string, capacity: number) => void;
  onCancelAdd: () => void;
}

function FloorPlane({ onClick }: { onClick: (point: THREE.Vector3) => void }) {
  const handleClick = useCallback(
    (event: { stopPropagation: () => void; point: THREE.Vector3 }) => {
      event.stopPropagation();
      onClick(event.point);
    },
    [onClick]
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#374151" transparent opacity={0.3} />
    </mesh>
  );
}

function SceneContent({
  modelUrl,
  tables,
  selectedTableId,
  pendingPosition,
  onModelClick,
  onTableSelect,
  onConfirmTable,
  onCancelAdd,
}: ModelWithRaycastProps) {
  return (
    <>
      <FloorPlane onClick={onModelClick} />

      {modelUrl && (
        <ModelLoader modelUrl={modelUrl} onModelClick={onModelClick} />
      )}

      {tables.map((table) => (
        <TableMarker
          key={table.id}
          table={table}
          isSelected={table.id === selectedTableId}
          onClick={() => onTableSelect(table.id)}
        />
      ))}

      {pendingPosition && (
        <AddTableDialog
          position={pendingPosition}
          onConfirm={onConfirmTable}
          onCancel={onCancelAdd}
          tableCount={tables.length}
        />
      )}
    </>
  );
}

function ModelLoader({
  modelUrl,
  onModelClick,
}: {
  modelUrl: string;
  onModelClick: (point: THREE.Vector3) => void;
}) {
  const { scene } = useGLTF(modelUrl);

  const handleClick = useCallback(
    (event: { stopPropagation: () => void; point: THREE.Vector3 }) => {
      event.stopPropagation();
      onModelClick(event.point);
    },
    [onModelClick]
  );

  return <primitive object={scene} onClick={handleClick} />;
}

interface EditTableDialogProps {
  table: TablePosition;
  onSave: (id: string, name: string, capacity: number) => void;
  onCancel: () => void;
}

function EditTableDialog({ table, onSave, onCancel }: EditTableDialogProps) {
  const [name, setName] = useState(table.name);
  const [capacity, setCapacity] = useState(table.capacity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(table.id, name.trim(), capacity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-2xl w-80">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">
          Editar Mesa
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="editTableName"
              className="block text-sm text-slate-400 mb-1"
            >
              Nombre
            </label>
            <input
              id="editTableName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="editTableCapacity"
              className="block text-sm text-slate-400 mb-1"
            >
              Capacidad (personas)
            </label>
            <input
              id="editTableCapacity"
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) =>
                setCapacity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TableMarkerEditor({
  modelUrl,
  restaurantId,
  onSave,
}: TableMarkerEditorProps) {
  const [tables, setTables] = useState<TablePosition[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [pendingPosition, setPendingPosition] = useState<
    [number, number, number] | null
  >(null);
  const [editingTable, setEditingTable] = useState<TablePosition | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleModelClick = useCallback((point: THREE.Vector3) => {
    setPendingPosition([point.x, point.y + 0.3, point.z]);
    setSelectedTableId(null);
  }, []);

  const handleConfirmTable = useCallback(
    (name: string, capacity: number) => {
      if (!pendingPosition) return;

      const newTable: TablePosition = {
        id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        position: pendingPosition,
        capacity,
      };

      setTables((prev) => [...prev, newTable]);
      setPendingPosition(null);
    },
    [pendingPosition]
  );

  const handleCancelAdd = useCallback(() => {
    setPendingPosition(null);
  }, []);

  const handleTableSelect = useCallback((id: string) => {
    setSelectedTableId((prev) => (prev === id ? null : id));
    setPendingPosition(null);
  }, []);

  const handleDeleteTable = useCallback(
    (id: string) => {
      setTables((prev) => prev.filter((t) => t.id !== id));
      if (selectedTableId === id) {
        setSelectedTableId(null);
      }
    },
    [selectedTableId]
  );

  const handleEditTable = useCallback((table: TablePosition) => {
    setEditingTable(table);
  }, []);

  const handleSaveEdit = useCallback(
    (id: string, name: string, capacity: number) => {
      setTables((prev) =>
        prev.map((t) => (t.id === id ? { ...t, name, capacity } : t))
      );
      setEditingTable(null);
    },
    []
  );

  const handleSaveLayout = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(tables);
    } finally {
      setIsSaving(false);
    }
  }, [tables, onSave]);

  return (
    <div className="flex h-full w-full gap-4">
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl">
        <Canvas
          camera={{ position: [0, 10, 15], fov: 50 }}
          dpr={1}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'default',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#1e293b');
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 8]} intensity={1} />
          <directionalLight position={[-8, 8, -8]} intensity={0.4} />

          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={2}
            maxDistance={25}
            dampingFactor={0.05}
            enableDamping
          />

          <SceneContent
            modelUrl={modelUrl}
            tables={tables}
            selectedTableId={selectedTableId}
            pendingPosition={pendingPosition}
            onModelClick={handleModelClick}
            onTableSelect={handleTableSelect}
            onConfirmTable={handleConfirmTable}
            onCancelAdd={handleCancelAdd}
          />
        </Canvas>

        <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-700/50">
          Haz clic en el modelo para añadir mesas
        </div>
      </div>

      <div className="w-80 flex flex-col rounded-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-sm shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-100">
            Editor de Mesas
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Restaurante: {restaurantId}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tables.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-400">No hay mesas marcadas</p>
              <p className="text-xs text-slate-500 mt-1">
                Haz clic en el modelo 3D para añadir mesas
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {tables.map((table) => (
                <li
                  key={table.id}
                  className={`rounded-lg border p-3 transition-colors cursor-pointer ${
                    selectedTableId === table.id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                  onClick={() => handleTableSelect(table.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-100">{table.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Capacidad: {table.capacity} personas
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTable(table);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-violet-400 hover:bg-slate-700 transition-colors"
                        title="Editar"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(table.id);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                        title="Eliminar"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    [{table.position[0].toFixed(2)},{' '}
                    {table.position[1].toFixed(2)},{' '}
                    {table.position[2].toFixed(2)}]
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">
              {tables.length} {tables.length === 1 ? 'mesa' : 'mesas'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveLayout}
            disabled={tables.length === 0 || isSaving}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
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
                Guardando...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Guardar layout
              </>
            )}
          </button>
        </div>
      </div>

      {editingTable && (
        <EditTableDialog
          table={editingTable}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTable(null)}
        />
      )}
    </div>
  );
}
