"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function SmokeTestBox() {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#F44336" opacity={0.75} transparent />
    </mesh>
  );
}

export default function SmokeTestCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ background: "#1A1A2E" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <SmokeTestBox />
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
}
