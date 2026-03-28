'use client';

import { Html, PointerLockControls, useGLTF } from '@react-three/drei';
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MutableRefObject,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { Box3, Vector3 } from 'three';

interface RestaurantTableRow {
  id: string;
  name: string;
  capacity: number;
  chairs: number | null;
  x_position: number | null;
  y_position: number | null;
}

interface Restaurant3DExperienceProps {
  restaurantId: string;
  restaurantName: string;
  modelPath: string;
  initialTables: RestaurantTableRow[];
}

interface ReservationDraft {
  table: RestaurantTableRow;
  date: string;
  time: string;
  people: number;
}

interface NavigationBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

interface MoveState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

type MoveDirection = keyof MoveState;

interface HTMLElementWithWebkitFullscreen extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

interface DocumentWithWebkitFullscreen extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

const EYE_HEIGHT = 1.7;
const DESKTOP_MOVE_SPEED = 4.25;
const MOBILE_MOVE_SPEED = 3.1;
const LOOK_SENSITIVITY = 0.0024;
const LOOK_PITCH_LIMIT = 1.05;

function formatTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatInitialTime() {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  return `${String(nextHour).padStart(2, '0')}:00`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createBoundsFromTables(tables: RestaurantTableRow[]): NavigationBounds {
  if (tables.length === 0) {
    return {
      minX: -12,
      maxX: 12,
      minY: EYE_HEIGHT,
      maxY: EYE_HEIGHT,
      minZ: -12,
      maxZ: 12,
    };
  }

  const xs = tables.map((table) => table.x_position ?? 0);
  const zs = tables.map((table) => table.y_position ?? 0);
  const margin = 4;

  return {
    minX: Math.min(...xs) - margin,
    maxX: Math.max(...xs) + margin,
    minY: EYE_HEIGHT,
    maxY: EYE_HEIGHT,
    minZ: Math.min(...zs) - margin,
    maxZ: Math.max(...zs) + margin,
  };
}

function normalizeBounds(bounds: NavigationBounds): NavigationBounds {
  const minSpan = 0.75;
  const minX = Math.min(bounds.minX, bounds.maxX - minSpan);
  const maxX = Math.max(bounds.maxX, bounds.minX + minSpan);
  const minY = Math.min(bounds.minY, bounds.maxY);
  const maxY = Math.max(bounds.maxY, bounds.minY);
  const minZ = Math.min(bounds.minZ, bounds.maxZ - minSpan);
  const maxZ = Math.max(bounds.maxZ, bounds.minZ + minSpan);

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

function mapKeyToDirection(key: string): MoveDirection | null {
  switch (key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      return 'forward';
    case 's':
    case 'arrowdown':
      return 'backward';
    case 'a':
    case 'arrowleft':
      return 'left';
    case 'd':
    case 'arrowright':
      return 'right';
    default:
      return null;
  }
}

function RestaurantModel({
  modelPath,
  onBoundsResolved,
}: {
  modelPath: string;
  onBoundsResolved: (bounds: NavigationBounds) => void;
}) {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    scene.updateWorldMatrix(true, true);
    const bounds = new Box3().setFromObject(scene);

    if (bounds.isEmpty()) return;

    const horizontalPadding = 0.85;
    const minXRaw = bounds.min.x + horizontalPadding;
    const maxXRaw = bounds.max.x - horizontalPadding;
    const minZRaw = bounds.min.z + horizontalPadding;
    const maxZRaw = bounds.max.z - horizontalPadding;

    const minX = minXRaw < maxXRaw ? minXRaw : bounds.min.x;
    const maxX = minXRaw < maxXRaw ? maxXRaw : bounds.max.x;
    const minZ = minZRaw < maxZRaw ? minZRaw : bounds.min.z;
    const maxZ = minZRaw < maxZRaw ? maxZRaw : bounds.max.z;

    onBoundsResolved(
      normalizeBounds({
        minX,
        maxX,
        minY: EYE_HEIGHT,
        maxY: EYE_HEIGHT,
        minZ,
        maxZ,
      }),
    );
  }, [onBoundsResolved, scene]);

  return <primitive object={scene} />;
}

function NavigationController({
  bounds,
  moveStateRef,
  touchLookDeltaRef,
  isTouchDevice,
  enabled,
}: {
  bounds: NavigationBounds;
  moveStateRef: MutableRefObject<MoveState>;
  touchLookDeltaRef: MutableRefObject<{ dx: number; dy: number }>;
  isTouchDevice: boolean;
  enabled: boolean;
}) {
  const normalizedBounds = useMemo(() => normalizeBounds(bounds), [bounds]);
  const forwardRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());
  const initializedRotationRef = useRef(false);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  useFrame(({ camera }, delta) => {
    if (!initializedRotationRef.current) {
      camera.rotation.order = 'YXZ';
      yawRef.current = camera.rotation.y;
      pitchRef.current = clamp(camera.rotation.x, -LOOK_PITCH_LIMIT, LOOK_PITCH_LIMIT);
      initializedRotationRef.current = true;
    }

    if (!enabled) {
      camera.position.x = clamp(
        camera.position.x,
        normalizedBounds.minX,
        normalizedBounds.maxX,
      );
      camera.position.z = clamp(
        camera.position.z,
        normalizedBounds.minZ,
        normalizedBounds.maxZ,
      );
      camera.position.y = EYE_HEIGHT;
      return;
    }

    if (isTouchDevice) {
      const lookDelta = touchLookDeltaRef.current;
      if (lookDelta.dx !== 0 || lookDelta.dy !== 0) {
        yawRef.current -= lookDelta.dx * LOOK_SENSITIVITY;
        pitchRef.current = clamp(
          pitchRef.current - lookDelta.dy * LOOK_SENSITIVITY,
          -LOOK_PITCH_LIMIT,
          LOOK_PITCH_LIMIT,
        );
        touchLookDeltaRef.current.dx = 0;
        touchLookDeltaRef.current.dy = 0;
      }

      setIsFullscreenFallback(true);

      camera.rotation.order = 'YXZ';
      camera.rotation.y = yawRef.current;
      camera.rotation.x = pitchRef.current;
    } else {
      camera.rotation.order = 'YXZ';
      camera.rotation.x = clamp(camera.rotation.x, -LOOK_PITCH_LIMIT, LOOK_PITCH_LIMIT);
      yawRef.current = camera.rotation.y;
      pitchRef.current = camera.rotation.x;
    }

    const frameSpeed = (isTouchDevice ? MOBILE_MOVE_SPEED : DESKTOP_MOVE_SPEED) * delta;
    const moveState = moveStateRef.current;

    if (moveState.forward || moveState.backward || moveState.left || moveState.right) {
      const forward = forwardRef.current;
      const right = rightRef.current;

      camera.getWorldDirection(forward);
      forward.y = 0;
      if (forward.lengthSq() < 1e-8) {
        forward.set(0, 0, -1);
      }
      forward.normalize();

      right.set(-forward.z, 0, forward.x).normalize();

      if (moveState.forward) {
        camera.position.addScaledVector(forward, frameSpeed);
      }
      if (moveState.backward) {
        camera.position.addScaledVector(forward, -frameSpeed);
      }
      if (moveState.left) {
        camera.position.addScaledVector(right, -frameSpeed);
      }
      if (moveState.right) {
        camera.position.addScaledVector(right, frameSpeed);
      }
    }

    camera.position.x = clamp(
      camera.position.x,
      normalizedBounds.minX,
      normalizedBounds.maxX,
    );
    camera.position.z = clamp(
      camera.position.z,
      normalizedBounds.minZ,
      normalizedBounds.maxZ,
    );
    camera.position.y = EYE_HEIGHT;
  });

  return null;
}

function SceneTables({
  tables,
  reservedTableIds,
  reservingTableId,
  onTableClick,
  showLabels,
  isInteractive,
}: {
  tables: RestaurantTableRow[];
  reservedTableIds: string[];
  reservingTableId: string | null;
  onTableClick: (table: RestaurantTableRow) => void;
  showLabels: boolean;
  isInteractive: boolean;
}) {
  const reservedSet = useMemo(() => new Set(reservedTableIds), [reservedTableIds]);

  return (
    <>
      {tables.map((table) => {
        const isReserved = reservedSet.has(table.id);
        const isReserving = reservingTableId === table.id;
        const color = isReserved ? '#dc2626' : '#22c55e';
        const x = table.x_position ?? 0;
        const z = table.y_position ?? 0;
        const y = 0.45;

        return (
          <group key={table.id} position={[x, y, z]}>
            <mesh
              castShadow
              receiveShadow
              onClick={(event: ThreeEvent<MouseEvent>) => {
                event.stopPropagation();
                if (!isInteractive || isReserved) return;
                onTableClick(table);
              }}
            >
              <cylinderGeometry args={[0.42, 0.42, 0.16, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isReserving ? 0.8 : 0.45}
                transparent
                opacity={0.9}
              />
            </mesh>
            {showLabels && (
              <Html position={[0, 0.45, 0]} center distanceFactor={12}>
                <div
                  className={`rounded-md px-2 py-1 text-[11px] font-medium text-white ${
                    isReserved ? 'bg-red-600/90' : 'bg-emerald-600/90'
                  }`}
                >
                  {table.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

export default function Restaurant3DExperience({
  restaurantId,
  restaurantName,
  modelPath,
  initialTables,
}: Restaurant3DExperienceProps) {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const moveStateRef = useRef<MoveState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const touchLookDeltaRef = useRef({ dx: 0, dy: 0 });
  const touchLookLastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasAutoRequestedPointerLockRef = useRef(false);
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const stageElementId = useMemo(
    () => `restaurant-3d-stage-${restaurantId.slice(0, 8)}`,
    [restaurantId],
  );

  const [tables, setTables] = useState<RestaurantTableRow[]>(initialTables);
  const [hasModelBounds, setHasModelBounds] = useState(false);
  const [navigationBounds, setNavigationBounds] = useState<NavigationBounds>(() =>
    normalizeBounds(createBoundsFromTables(initialTables)),
  );
  const [date, setDate] = useState(formatTodayDate);
  const [time, setTime] = useState(formatInitialTime);
  const [reservedTableIds, setReservedTableIds] = useState<string[]>([]);
  const [reservingTableId, setReservingTableId] = useState<string | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenFallback, setIsFullscreenFallback] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isLookPadActive, setIsLookPadActive] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [reservationDraft, setReservationDraft] = useState<ReservationDraft | null>(
    null,
  );
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fallbackNavigationBounds = useMemo(
    () => normalizeBounds(createBoundsFromTables(tables)),
    [tables],
  );
  const effectiveNavigationBounds = hasModelBounds
    ? navigationBounds
    : fallbackNavigationBounds;
  const isReservationModalOpen = Boolean(reservationDraft);
  const isStageFullscreen = isFullscreen || isFullscreenFallback;

  const setMoveDirection = useCallback((direction: MoveDirection, active: boolean) => {
    moveStateRef.current[direction] = active;
  }, []);

  const stopAllMovement = useCallback(() => {
    moveStateRef.current.forward = false;
    moveStateRef.current.backward = false;
    moveStateRef.current.left = false;
    moveStateRef.current.right = false;
  }, []);

  const requestPointerLock = useCallback(() => {
    if (isTouchDevice) return;
    const canvas = sceneContainerRef.current?.querySelector('canvas');
    if (!canvas?.requestPointerLock) return;

    try {
      canvas.requestPointerLock();
    } catch {
      setMessage({
        type: 'error',
        text: 'No se pudo activar el modo FPS del mouse.',
      });
    }
  }, [isTouchDevice]);

  const toggleFullscreen = useCallback(async () => {
    if (!sceneContainerRef.current) return;

    const doc = document as DocumentWithWebkitFullscreen;
    const element = sceneContainerRef.current as HTMLElementWithWebkitFullscreen;
    const activeFullscreenElement =
      document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;

    try {
      if (activeFullscreenElement || isFullscreenFallback) {
        if (activeFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
            return;
          }

          if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
            return;
          }
        }

        setIsFullscreenFallback(false);
        return;
      }
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        return;
      }

      if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
        return;
      }

      setIsFullscreenFallback(true);
    } catch {
      if (!activeFullscreenElement) {
        setIsFullscreenFallback(true);
        return;
      }
      setMessage({
        type: 'error',
        text: 'No se pudo cambiar a pantalla completa en este navegador.',
      });
    }
  }, [isFullscreenFallback]);

  const openReservationModal = useCallback(
    (table: RestaurantTableRow) => {
      if (document.pointerLockElement && document.exitPointerLock) {
        document.exitPointerLock();
      }

      setMessage(null);
      setReservationDraft({
        table,
        date,
        time,
        people: Math.max(1, table.chairs ?? table.capacity),
      });
    },
    [date, time],
  );

  const closeReservationModal = useCallback(() => {
    setReservationDraft(null);
    setReservationSubmitting(false);
    setReservingTableId(null);
  }, []);

  useEffect(() => {
    if (!isReservationModalOpen) return;

    stopAllMovement();

    if (document.pointerLockElement && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }, [isReservationModalOpen, stopAllMovement]);

  const handleLookPadTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (!touch) return;

      event.preventDefault();
      touchLookLastPointRef.current = { x: touch.clientX, y: touch.clientY };
      setIsLookPadActive(true);
    },
    [],
  );

  const handleLookPadTouchMove = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (!touch || !touchLookLastPointRef.current) return;

      event.preventDefault();

      const previous = touchLookLastPointRef.current;
      touchLookDeltaRef.current.dx += touch.clientX - previous.x;
      touchLookDeltaRef.current.dy += touch.clientY - previous.y;
      touchLookLastPointRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [],
  );

  const endLookPadTouch = useCallback(() => {
    touchLookLastPointRef.current = null;
    touchLookDeltaRef.current.dx = 0;
    touchLookDeltaRef.current.dy = 0;
    setIsLookPadActive(false);
  }, []);

  const handleModelBoundsResolved = useCallback((nextBounds: NavigationBounds) => {
    setNavigationBounds(
      normalizeBounds({
        ...nextBounds,
        minY: EYE_HEIGHT,
        maxY: EYE_HEIGHT,
      }),
    );
    setHasModelBounds(true);
  }, []);

  const loadTables = useCallback(async () => {
    const { data, error } = await supabase
      .from('restaurants_tables')
      .select('id, name, capacity, chairs, x_position, y_position')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true });

    if (error) {
      setMessage({ type: 'error', text: `Error cargando mesas: ${error.message}` });
      return;
    }

    setTables((data ?? []) as RestaurantTableRow[]);
  }, [restaurantId, supabase]);

  const loadReservedTables = useCallback(async () => {
    if (!date || !time) {
      setReservedTableIds([]);
      return;
    }

    setLoadingAvailability(true);
    const { data, error } = await supabase
      .from('reservations')
      .select('table_id')
      .eq('restaurant_id', restaurantId)
      .eq('date', date)
      .eq('time', time)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      setMessage({
        type: 'error',
        text: `Error comprobando ocupación: ${error.message}`,
      });
      setLoadingAvailability(false);
      return;
    }

    const ids = ((data ?? []) as Array<{ table_id: string | null }>)
      .map((reservation) => reservation.table_id)
      .filter((value): value is string => Boolean(value));

    setReservedTableIds(ids);
    setLoadingAvailability(false);
  }, [date, restaurantId, supabase, time]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadTables();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadTables]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadReservedTables();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadReservedTables]);


  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updateTouchMode = () => {
      setIsTouchDevice(mediaQuery.matches || navigator.maxTouchPoints > 0);
    };

    updateTouchMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateTouchMode);
      return () => {
        mediaQuery.removeEventListener('change', updateTouchMode);
      };
    }

    mediaQuery.addListener(updateTouchMode);
    return () => {
      mediaQuery.removeListener(updateTouchMode);
    };
  }, []);

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(Boolean(document.pointerLockElement));
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  useEffect(() => {
    if (!isTouchDevice) return;
    if (document.pointerLockElement && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }, [isTouchDevice]);

  useEffect(() => {
    const reservationsChannel = supabase
      .channel(`restaurant-reservations-3d-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          void loadReservedTables();
        },
      )
      .subscribe();

    const tablesChannel = supabase
      .channel(`restaurant-tables-3d-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurants_tables',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          void loadTables();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(reservationsChannel);
      void supabase.removeChannel(tablesChannel);
    };
  }, [loadReservedTables, loadTables, restaurantId, supabase]);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isReservationModalOpen) return;
      if (isEditableTarget(event.target)) return;
      const direction = mapKeyToDirection(event.key);
      if (!direction) return;
      setMoveDirection(direction, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isReservationModalOpen) return;
      const direction = mapKeyToDirection(event.key);
      if (!direction) return;
      setMoveDirection(direction, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isReservationModalOpen, setMoveDirection]);

  useEffect(() => {
    const handlePointerUp = () => {
      stopAllMovement();
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('blur', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
    };
  }, [stopAllMovement]);

  useEffect(() => {
    const doc = document as DocumentWithWebkitFullscreen;

    const handleFullscreenChange = () => {
      const activeFullscreenElement =
        document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
      setIsFullscreen(Boolean(activeFullscreenElement));
      if (activeFullscreenElement) {
        setIsFullscreenFallback(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!isStageFullscreen) {
      hasAutoRequestedPointerLockRef.current = false;
      return;
    }

    if (
      isTouchDevice ||
      isReservationModalOpen ||
      hasAutoRequestedPointerLockRef.current
    ) {
      return;
    }

    hasAutoRequestedPointerLockRef.current = true;

    const timerId = window.setTimeout(() => {
      requestPointerLock();
    }, 120);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    isStageFullscreen,
    isReservationModalOpen,
    isTouchDevice,
    requestPointerLock,
  ]);

  useEffect(() => {
    if (!isStageFullscreen) {
      stopAllMovement();
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const blockedKeys = new Set([
      'PageUp',
      'PageDown',
      'Home',
      'End',
      ' ',
    ]);

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (blockedKeys.has(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStageFullscreen, stopAllMovement]);

  const handleReservationSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!reservationDraft) return;

      setMessage(null);
      setReservationSubmitting(true);
      setReservingTableId(reservationDraft.table.id);

      const maxSeats = Math.max(
        1,
        reservationDraft.table.chairs ?? reservationDraft.table.capacity,
      );
      const people = Math.max(1, Math.floor(reservationDraft.people || maxSeats));

      if (people > maxSeats) {
        setMessage({
          type: 'error',
          text: `La mesa ${reservationDraft.table.name} admite hasta ${maxSeats} personas.`,
        });
        setReservationSubmitting(false);
        setReservingTableId(null);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage({ type: 'error', text: 'Debes iniciar sesión para reservar.' });
        setReservationSubmitting(false);
        setReservingTableId(null);
        return;
      }

      const { data: existingRows, error: existingError } = await supabase
        .from('reservations')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('table_id', reservationDraft.table.id)
        .eq('date', reservationDraft.date)
        .eq('time', reservationDraft.time)
        .in('status', ['pending', 'confirmed'])
        .limit(1);

      if (existingError) {
        setMessage({
          type: 'error',
          text: `No se pudo validar disponibilidad: ${existingError.message}`,
        });
        setReservationSubmitting(false);
        setReservingTableId(null);
        return;
      }

      if ((existingRows ?? []).length > 0) {
        setMessage({
          type: 'error',
          text: `${reservationDraft.table.name} ya está ocupada en ese horario.`,
        });
        setReservationSubmitting(false);
        setReservingTableId(null);
        return;
      }

      const { error: insertError } = await supabase.from('reservations').insert({
        restaurant_id: restaurantId,
        client_id: user.id,
        reservation_date: `${reservationDraft.date}T${reservationDraft.time}:00`,
        date: reservationDraft.date,
        time: reservationDraft.time,
        people,
        table_id: reservationDraft.table.id,
      });

      if (insertError) {
        setMessage({
          type: 'error',
          text: `No se pudo reservar ${reservationDraft.table.name}: ${insertError.message}`,
        });
        setReservationSubmitting(false);
        setReservingTableId(null);
        return;
      }

      if (reservationDraft.date === date && reservationDraft.time === time) {
        setReservedTableIds((prev) => [...new Set([...prev, reservationDraft.table.id])]);
      }

      setDate(reservationDraft.date);
      setTime(reservationDraft.time);
      setReservationDraft(null);
      setMessage({
        type: 'success',
        text: `Mesa ${reservationDraft.table.name} reservada en ${restaurantName} (${reservationDraft.date} ${reservationDraft.time}).`,
      });
      setReservationSubmitting(false);
      setReservingTableId(null);
    },
    [date, reservationDraft, restaurantId, restaurantName, supabase, time],
  );

  const today = useMemo(() => formatTodayDate(), []);
  const availableCount = tables.filter(
    (table) => !reservedTableIds.includes(table.id),
  ).length;

  const moveButtonClass =
    'h-11 w-11 select-none touch-none rounded-xl border border-slate-600/80 bg-slate-900/90 text-sm font-semibold text-slate-100 backdrop-blur-sm active:bg-slate-700';
  const mobileControlStyle: CSSProperties = {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    touchAction: 'none',
  };

  return (
    <section className="rounded-2xl border border-slate-700/50 bg-slate-900/90 p-5 shadow-2xl">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Recorrido 3D interactivo
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Navegación FPS estable con límites internos del restaurante y altura fija.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Fecha y hora se eligen al reservar en el modal de cada mesa.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-300">
            Libres: {availableCount}
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
            Ocupadas: {tables.length - availableCount}
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            message.type === 'error'
              ? 'bg-red-500/10 text-red-300'
              : 'bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div
        id={stageElementId}
        ref={sceneContainerRef}
        className={`relative overflow-hidden border border-slate-700/50 bg-slate-950 ${
          isStageFullscreen
            ? 'fixed inset-0 z-[3000] h-screen w-screen rounded-none border-0'
            : 'h-[560px] rounded-xl'
        }`}
        onWheel={(event) => {
          if (isStageFullscreen || isPointerLocked) {
            event.preventDefault();
          }
        }}
      >
        <Canvas camera={{ position: [0, EYE_HEIGHT, 8], fov: 70 }} shadows>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[8, 14, 6]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-8, 6, -4]} intensity={0.4} />
          <pointLight position={[0, 2, 0]} intensity={0.35} color="#f8fafc" />
          <gridHelper args={[60, 60, '#334155', '#1e293b']} />

          <Suspense fallback={null}>
            <RestaurantModel
              modelPath={modelPath}
              onBoundsResolved={handleModelBoundsResolved}
            />
            <SceneTables
              tables={tables}
              reservedTableIds={reservedTableIds}
              reservingTableId={reservingTableId}
              onTableClick={openReservationModal}
              showLabels={!isReservationModalOpen}
              isInteractive={!isReservationModalOpen}
            />
          </Suspense>

          <NavigationController
            bounds={effectiveNavigationBounds}
            moveStateRef={moveStateRef}
            touchLookDeltaRef={touchLookDeltaRef}
            isTouchDevice={isTouchDevice}
            enabled={!isReservationModalOpen}
          />

          {!isTouchDevice && !isReservationModalOpen && (
            <PointerLockControls selector={`#${stageElementId}`} />
          )}
        </Canvas>
        {!isReservationModalOpen && (
          <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center">
            <span className="select-none text-2xl font-bold tracking-tight text-slate-100/90 drop-shadow-[0_0_8px_rgba(15,23,42,0.85)]">
              ×
            </span>
          </div>
        )}
        {!isReservationModalOpen && (
          <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
            {!isTouchDevice && (
              <button
                type="button"
                onClick={requestPointerLock}
                className="rounded-lg border border-slate-600/80 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-100 backdrop-blur-sm transition hover:bg-slate-800"
              >
                {isPointerLocked
                  ? 'Mouse FPS activo (ESC para liberar)'
                  : 'Activar mouse FPS'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                void toggleFullscreen();
              }}
              className="rounded-lg border border-slate-600/80 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-100 backdrop-blur-sm transition hover:bg-slate-800"
            >
              {isStageFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
            </button>
          </div>
        )}

        {isTouchDevice && !isReservationModalOpen && (
          <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-end justify-between p-3">
            <div className="pointer-events-auto grid grid-cols-3 gap-2">
              <span />
              <button
                type="button"
                className={moveButtonClass}
                style={mobileControlStyle}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setMoveDirection('forward', true);
                }}
                onPointerUp={() => setMoveDirection('forward', false)}
                onPointerLeave={() => setMoveDirection('forward', false)}
                onPointerCancel={() => setMoveDirection('forward', false)}
              >
                ↑
              </button>
              <span />
              <button
                type="button"
                className={moveButtonClass}
                style={mobileControlStyle}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setMoveDirection('left', true);
                }}
                onPointerUp={() => setMoveDirection('left', false)}
                onPointerLeave={() => setMoveDirection('left', false)}
                onPointerCancel={() => setMoveDirection('left', false)}
              >
                ←
              </button>
              <span />
              <button
                type="button"
                className={moveButtonClass}
                style={mobileControlStyle}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setMoveDirection('right', true);
                }}
                onPointerUp={() => setMoveDirection('right', false)}
                onPointerLeave={() => setMoveDirection('right', false)}
                onPointerCancel={() => setMoveDirection('right', false)}
              >
                →
              </button>
              <span />
              <button
                type="button"
                className={moveButtonClass}
                style={mobileControlStyle}
                onContextMenu={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setMoveDirection('backward', true);
                }}
                onPointerUp={() => setMoveDirection('backward', false)}
                onPointerLeave={() => setMoveDirection('backward', false)}
                onPointerCancel={() => setMoveDirection('backward', false)}
              >
                ↓
              </button>
              <span />
            </div>

            <div
              className={`pointer-events-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-slate-600/80 text-xs font-medium text-slate-100 backdrop-blur-sm touch-none ${
                isLookPadActive ? 'bg-violet-600/50' : 'bg-slate-900/85'
              }`}
              style={mobileControlStyle}
              onContextMenu={(event) => event.preventDefault()}
              onTouchStart={handleLookPadTouchStart}
              onTouchMove={handleLookPadTouchMove}
              onTouchEnd={endLookPadTouch}
              onTouchCancel={endLookPadTouch}
            >
              Mirar
            </div>
          </div>
        )}

        {reservationDraft && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900 p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    Reservar {reservationDraft.table.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Capacidad de la mesa: {reservationDraft.table.chairs ?? reservationDraft.table.capacity} persona(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeReservationModal}
                  className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                  disabled={reservationSubmitting}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReservationSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-slate-300">
                    Fecha
                    <input
                      type="date"
                      required
                      min={today}
                      value={reservationDraft.date}
                      onChange={(event) =>
                        setReservationDraft((prev) =>
                          prev ? { ...prev, date: event.target.value } : prev,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                    />
                  </label>
                  <label className="text-xs text-slate-300">
                    Hora
                    <input
                      type="time"
                      required
                      value={reservationDraft.time}
                      onChange={(event) =>
                        setReservationDraft((prev) =>
                          prev ? { ...prev, time: event.target.value } : prev,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                    />
                  </label>
                </div>

                <label className="block text-xs text-slate-300">
                  Personas
                  <input
                    type="number"
                    min={1}
                    max={reservationDraft.table.chairs ?? reservationDraft.table.capacity}
                    value={reservationDraft.people}
                    onChange={(event) =>
                      setReservationDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              people: Math.max(1, Number(event.target.value) || 1),
                            }
                          : prev,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                  />
                </label>


                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeReservationModal}
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    disabled={reservationSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reservationSubmitting}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {reservationSubmitting ? 'Reservando...' : 'Confirmar reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-xs">
          <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-slate-300 backdrop-blur-sm">
            {isTouchDevice
              ? 'Mobile: pad izq mover · pad der mirar · altura fija'
              : 'Desktop: W adelante · S atrás · A izquierda · D derecha · mouse FPS'}
          </div>
          <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-slate-400 backdrop-blur-sm">
            {loadingAvailability
              ? 'Sincronizando ocupación…'
              : isPointerLocked
                ? 'Dentro de límites seguros del restaurante'
                : 'Límites activos: no puedes salir del restaurante'}
          </div>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload('/models/restaurantElena2026.glb');
