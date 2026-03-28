"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface Props {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  reserved: boolean;
  onClick: (id: string) => void;
}

export default function Table({ id, position, rotation, reserved, onClick }: Props) {
  const mesh = useRef<any>(null);

  useFrame(() => {
    if (mesh.current) {
      // Animación opcional
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={rotation}
      onClick={() => onClick(id)}
    >
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color={reserved ? "red" : "green"} />
    </mesh>
  );
}