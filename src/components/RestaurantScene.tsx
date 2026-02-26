/* eslint-disable react/no-unknown-property */
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const TABLE_EMISSIVE = {
  available: new THREE.Color(0x22c55e),
  occupied: new THREE.Color(0xdc2626),
  none: new THREE.Color(0x000000),
} as const;

const EMISSIVE_INTENSITY = {
  active: 0.3,
  selected: 0.6,
} as const;

interface TablePosition {
  id: string;
  name: string;
  position: [number, number, number];
  capacity: number;
}

interface RestaurantSceneProps {
  onTableClick: (tableName: string) => void;
  onReserveNow: () => void;
  modelUrl: string;
  selectedTable: string | null;
  occupiedTables: string[];
  tablePositions?: TablePosition[];
}

type ViewMode = 'orbit' | 'table';

interface ModelProps extends RestaurantSceneProps {
  viewMode: ViewMode;
  onViewFromTable: (position: THREE.Vector3, lookAt: THREE.Vector3) => void;
}

const TableMarker = ({
  table,
  isSelected,
  isOccupied,
  onClick,
}: {
  table: TablePosition;
  isSelected: boolean;
  isOccupied: boolean;
  onClick: () => void;
}) => {
  const color = isOccupied ? '#dc2626' : '#22c55e';

  return (
    <group position={table.position} onClick={onClick}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.9 : 0.6}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      <Html position={[0, 0.3, 0]} center>
        <div
          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            isOccupied ? 'bg-red-500/90' : 'bg-green-500/90'
          } text-white`}
        >
          {table.name} ({table.capacity}p)
        </div>
      </Html>
    </group>
  );
};

function Model({
  onTableClick,
  onReserveNow,
  modelUrl,
  selectedTable,
  occupiedTables,
  tablePositions,
  viewMode,
  onViewFromTable,
}: ModelProps) {
  const { scene } = useGLTF(modelUrl);
  const occupiedSet = useMemo(() => new Set(occupiedTables), [occupiedTables]);

  const hasMeshes = useMemo(() => {
    let foundMesh = false;
    scene.traverse((child) => {
      if (!foundMesh && child instanceof THREE.Mesh) {
        foundMesh = true;
      }
    });
    return foundMesh;
  }, [scene]);

  useMemo(() => {
    scene.traverse((child) => {
      if (child.name?.startsWith('table_')) {
        child.userData.isTable = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.userData?.isTable) {
          const isOccupied = occupiedSet.has(child.name);
          const isSelected = child.name === selectedTable;
          const emissiveColor = isOccupied
            ? TABLE_EMISSIVE.occupied
            : TABLE_EMISSIVE.available;
          const intensity = isSelected
            ? EMISSIVE_INTENSITY.selected
            : EMISSIVE_INTENSITY.active;

          const applyEmissive = (material: THREE.Material) => {
            if (
              material instanceof THREE.MeshStandardMaterial ||
              material instanceof THREE.MeshPhysicalMaterial
            ) {
              material.emissive = emissiveColor;
              material.emissiveIntensity = intensity;
              material.needsUpdate = true;
            }
          };

          if (Array.isArray(child.material)) {
            child.material.forEach(applyEmissive);
          } else if (child.material) {
            applyEmissive(child.material);
          }
        }
      }
    });
  }, [scene, occupiedSet, selectedTable]);

  const handleViewFromTable = useCallback(
    (tableName: string) => {
      scene.traverse((child) => {
        if (child.name === tableName) {
          const tablePos = new THREE.Vector3();
          child.getWorldPosition(tablePos);

          const cameraPos = new THREE.Vector3(
            tablePos.x,
            tablePos.y + 1.2,
            tablePos.z + 0.3
          );

          const box = new THREE.Box3().setFromObject(scene);
          const center = box.getCenter(new THREE.Vector3());
          const lookAtPos = new THREE.Vector3(
            center.x,
            tablePos.y + 0.5,
            center.z
          );

          onViewFromTable(cameraPos, lookAtPos);
        }
      });
    },
    [scene, onViewFromTable]
  );

  const selectedPosition = useMemo<[number, number, number] | null>(() => {
    if (!selectedTable) return null;
    let position: [number, number, number] | null = null;
    scene.traverse((child) => {
      if (!position && child.name === selectedTable) {
        const worldPosition = new THREE.Vector3();
        child.getWorldPosition(worldPosition);
        position = [worldPosition.x, worldPosition.y + 1.0, worldPosition.z];
      }
    });
    return position;
  }, [scene, selectedTable]);

  return (
    <>
      {hasMeshes ? (
        <primitive
          object={scene}
          onClick={(e: {
            stopPropagation: () => void;
            object?: { userData?: { isTable?: boolean }; name?: string };
          }) => {
            e.stopPropagation();
            if (e.object?.userData?.isTable && e.object.name) {
              onTableClick(e.object.name);
            }
          }}
        />
      ) : (
        <group>
          <mesh
            position={[0, -0.02, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial
              color="#c4b5a0"
              roughness={0.9}
              metalness={0}
            />
          </mesh>
          <mesh
            name="table_auto_01"
            userData={{ isTable: true }}
            position={[-2.5, 0.38, -1.5]}
            onClick={() => onTableClick('table_auto_01')}
            castShadow
          >
            <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
            <meshStandardMaterial
              color="#5c4033"
              roughness={0.4}
              metalness={0.05}
              emissive={
                occupiedSet.has('table_auto_01')
                  ? TABLE_EMISSIVE.occupied
                  : TABLE_EMISSIVE.available
              }
              emissiveIntensity={
                selectedTable === 'table_auto_01'
                  ? EMISSIVE_INTENSITY.selected
                  : EMISSIVE_INTENSITY.active
              }
            />
          </mesh>
          <mesh position={[-2.5, 0.18, -1.5]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.35, 16]} />
            <meshStandardMaterial
              color="#2a2a2a"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * Math.PI) / 2;
            const x = -2.5 + Math.cos(angle) * 0.9;
            const z = -1.5 + Math.sin(angle) * 0.9;
            return (
              <group
                key={`chair1-${i}`}
                position={[x, 0, z]}
                rotation={[0, -angle + Math.PI, 0]}
              >
                <mesh position={[0, 0.25, 0]} castShadow>
                  <boxGeometry args={[0.4, 0.04, 0.4]} />
                  <meshStandardMaterial
                    color="#4a4a4a"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>
                <mesh position={[0, 0.45, -0.18]} castShadow>
                  <boxGeometry args={[0.38, 0.35, 0.04]} />
                  <meshStandardMaterial
                    color="#4a4a4a"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>
                {[
                  [-0.15, -0.15],
                  [0.15, -0.15],
                  [-0.15, 0.15],
                  [0.15, 0.15],
                ].map(([lx, lz], li) => (
                  <mesh key={li} position={[lx, 0.12, lz]} castShadow>
                    <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
                    <meshStandardMaterial
                      color="#2a2a2a"
                      roughness={0.3}
                      metalness={0.8}
                    />
                  </mesh>
                ))}
              </group>
            );
          })}
          <mesh
            name="table_auto_02"
            userData={{ isTable: true }}
            position={[2.5, 0.38, 1.5]}
            onClick={() => onTableClick('table_auto_02')}
            castShadow
          >
            <boxGeometry args={[1.4, 0.06, 0.9]} />
            <meshStandardMaterial
              color="#8b7355"
              roughness={0.35}
              metalness={0.02}
              emissive={
                occupiedSet.has('table_auto_02')
                  ? TABLE_EMISSIVE.occupied
                  : TABLE_EMISSIVE.available
              }
              emissiveIntensity={
                selectedTable === 'table_auto_02'
                  ? EMISSIVE_INTENSITY.selected
                  : EMISSIVE_INTENSITY.active
              }
            />
          </mesh>
          {[
            [-0.55, -0.35],
            [0.55, -0.35],
            [-0.55, 0.35],
            [0.55, 0.35],
          ].map(([lx, lz], i) => (
            <mesh
              key={`leg2-${i}`}
              position={[2.5 + lx, 0.17, 1.5 + lz]}
              castShadow
            >
              <boxGeometry args={[0.06, 0.35, 0.06]} />
              <meshStandardMaterial
                color="#5c4033"
                roughness={0.4}
                metalness={0.05}
              />
            </mesh>
          ))}
          {[
            [2, 1.5],
            [3, 1.5],
          ].map(([cx, cz], i) => (
            <group
              key={`chair2-${i}`}
              position={[cx, 0, cz]}
              rotation={[0, i === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
            >
              <mesh position={[0, 0.28, 0]} castShadow>
                <boxGeometry args={[0.42, 0.05, 0.42]} />
                <meshStandardMaterial
                  color="#d4a574"
                  roughness={0.6}
                  metalness={0}
                />
              </mesh>
              <mesh position={[0, 0.5, -0.18]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.04]} />
                <meshStandardMaterial
                  color="#d4a574"
                  roughness={0.6}
                  metalness={0}
                />
              </mesh>
              {[
                [-0.16, -0.16],
                [0.16, -0.16],
                [-0.16, 0.16],
                [0.16, 0.16],
              ].map(([lx, lz], li) => (
                <mesh key={li} position={[lx, 0.13, lz]} castShadow>
                  <cylinderGeometry args={[0.025, 0.025, 0.26, 8]} />
                  <meshStandardMaterial
                    color="#8b7355"
                    roughness={0.4}
                    metalness={0.05}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {tablePositions &&
        tablePositions.length > 0 &&
        tablePositions.map((table) => (
          <TableMarker
            key={table.id}
            table={table}
            isSelected={selectedTable === table.name}
            isOccupied={occupiedSet.has(table.name)}
            onClick={() => onTableClick(table.name)}
          />
        ))}

      {selectedTable && selectedPosition && viewMode === 'orbit' && (
        <Html position={selectedPosition} center>
          <div className="rounded-xl border border-slate-600/80 bg-slate-900/95 backdrop-blur-sm p-3 shadow-2xl min-w-[140px]">
            <p className="mb-2 text-sm font-medium text-slate-100">
              {selectedTable}
            </p>
            {occupiedSet.has(selectedTable) ? (
              <p className="text-sm font-semibold text-red-400">Mesa ocupada</p>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onReserveNow}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                >
                  Reservar ahora
                </button>
                <button
                  type="button"
                  onClick={() => handleViewFromTable(selectedTable)}
                  className="w-full rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-600 transition-colors"
                >
                  Ver desde esta mesa
                </button>
              </div>
            )}
          </div>
        </Html>
      )}
    </>
  );
}

function CameraController({
  viewMode,
  targetPosition,
  targetLookAt,
  onReset,
}: {
  viewMode: ViewMode;
  targetPosition: THREE.Vector3 | null;
  targetLookAt: THREE.Vector3 | null;
  onReset: () => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    if (viewMode === 'table' && targetPosition && targetLookAt) {
      camera.position.copy(targetPosition);
      camera.lookAt(targetLookAt);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt);
        controlsRef.current.update();
      }
    }
  }, [viewMode, targetPosition, targetLookAt, camera]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
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
      {viewMode === 'table' && (
        <Html position={[0, 5, 0]} center>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg bg-slate-800/90 backdrop-blur-sm border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-lg"
          >
            Volver a vista general
          </button>
        </Html>
      )}
    </>
  );
}

export default function RestaurantScene({
  onTableClick,
  onReserveNow,
  modelUrl,
  selectedTable,
  occupiedTables,
  tablePositions,
}: RestaurantSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('orbit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
    null
  );
  const [targetLookAt, setTargetLookAt] = useState<THREE.Vector3 | null>(null);

  const handleViewFromTable = useCallback(
    (position: THREE.Vector3, lookAt: THREE.Vector3) => {
      setTargetPosition(position);
      setTargetLookAt(lookAt);
      setViewMode('table');
    },
    []
  );

  const handleResetView = useCallback(() => {
    setViewMode('orbit');
    setTargetPosition(null);
    setTargetLookAt(null);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl ${
        isFullscreen ? 'h-screen rounded-none border-0' : 'h-[520px]'
      }`}
    >
      <Canvas
        shadows
        camera={{ position: [0, 6, 10], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <color attach="background" args={['#1e293b']} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 15, 8]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-8, 8, -8]} intensity={0.5} />
        <pointLight position={[0, 4, 0]} intensity={0.3} color="#fef3c7" />

        <Environment preset="apartment" background={false} />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={10}
        />

        <CameraController
          viewMode={viewMode}
          targetPosition={targetPosition}
          targetLookAt={targetLookAt}
          onReset={handleResetView}
        />

        <Model
          onTableClick={onTableClick}
          onReserveNow={onReserveNow}
          modelUrl={modelUrl}
          selectedTable={selectedTable}
          occupiedTables={occupiedTables}
          tablePositions={tablePositions}
          viewMode={viewMode}
          onViewFromTable={handleViewFromTable}
        />
      </Canvas>

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 rounded-lg bg-slate-800/90 backdrop-blur-sm border border-slate-600 p-2.5 text-white hover:bg-slate-700 transition-colors shadow-lg"
        title={
          isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
        }
      >
        {isFullscreen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        )}
      </button>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Libre
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 text-red-300 backdrop-blur-sm border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Ocupada
          </span>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-700/50">
          {isFullscreen
            ? 'ESC para salir'
            : 'Arrastra para rotar / Scroll para zoom'}
        </div>
      </div>
    </div>
  );
}
