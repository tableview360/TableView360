"use client";
import { useGLTF } from "@react-three/drei";

interface Props {
  modelPath: string;
}

export default function RestaurantModel({ modelPath }: Props) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} />;
}