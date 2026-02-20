/* eslint-disable react/no-unknown-property */
import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

interface RestaurantSceneProps {
  onTableClick: (tableName: string) => void;
  modelUrl: string;
}

function Model({ onTableClick, modelUrl }: RestaurantSceneProps) {
  const { scene } = useGLTF(modelUrl);
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

  return (
    <>
      {hasMeshes ? (
        <primitive
          object={scene}
          onClick={(e) => {
            e.stopPropagation();
            if (e.object?.userData?.isTable) {
              onTableClick(e.object.name);
            }
          }}
        />
      ) : (
        <group>
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[6, 64]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh
            name="table_auto_01"
            userData={{ isTable: true }}
            position={[-1.8, 0.6, -0.6]}
            onClick={() => onTableClick('table_auto_01')}
          >
            <boxGeometry args={[1.2, 0.15, 1.2]} />
            <meshStandardMaterial color="#8b5cf6" />
          </mesh>
          <mesh
            name="table_auto_02"
            userData={{ isTable: true }}
            position={[1.8, 0.6, 0.8]}
            onClick={() => onTableClick('table_auto_02')}
          >
            <boxGeometry args={[1.2, 0.15, 1.2]} />
            <meshStandardMaterial color="#7c3aed" />
          </mesh>
        </group>
      )}
    </>
  );
}

export default function RestaurantScene({
  onTableClick,
  modelUrl,
}: RestaurantSceneProps) {
  return (
    <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900/60">
      <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[8, 10, 4]} intensity={1.1} />
        <Model onTableClick={onTableClick} modelUrl={modelUrl} />
      </Canvas>
    </div>
  );
}
