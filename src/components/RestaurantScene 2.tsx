/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

interface RestaurantSceneProps {
  onTableClick: (tableName: string) => void;
}

function Model({ onTableClick }: RestaurantSceneProps) {
  const { scene } = useGLTF('/restaurant.glb');

  useMemo(() => {
    scene.traverse((child) => {
      if (child.name?.startsWith('table_')) {
        child.userData.isTable = true;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation();
        if (e.object?.userData?.isTable) {
          onTableClick(e.object.name);
        }
      }}
    />
  );
}

useGLTF.preload('/restaurant.glb');

export default function RestaurantScene({
  onTableClick,
}: RestaurantSceneProps) {
  return (
    <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900/60">
      <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[8, 10, 4]} intensity={1.1} />
        <Model onTableClick={onTableClick} />
      </Canvas>
    </div>
  );
}
