import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { useStore } from './store';

// Helper to convert grid coordinates to world coordinates
export const CELL_SIZE = 1;
export function gridToWorld(gridX: number, gridZ: number, gridSize: number) {
  const offsetX = -gridSize / 2 + CELL_SIZE / 2;
  const offsetZ = -gridSize / 2 + CELL_SIZE / 2;
  return {
    x: gridX * CELL_SIZE + offsetX,
    z: gridZ * CELL_SIZE + offsetZ
  };
}

export function RobotModel() {
  const { x, z, dir, bag } = useStore((state) => state.robot);
  const gridSize = useStore((state) => state.gridSize);
  const groupRef = useRef<Group>(null);

  const targetWorldPos = gridToWorld(x, z, gridSize);
  
  // Directions: 0: East (+X), 1: North (-Z), 2: West (-X), 3: South (+Z)
  const targetRotationY = (dir * Math.PI) / 2;
  const hasBeeper = bag > 0;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth position interpolation
    groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, targetWorldPos.x, 10 * delta);
    groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, targetWorldPos.z, 10 * delta);

    // Smooth rotation interpolation
    // We need to handle rotation wrapping (e.g. going from 270 to 0)
    let currentRotY = groupRef.current.rotation.y;
    
    // Normalize angles
    const PI2 = Math.PI * 2;
    currentRotY = ((currentRotY % PI2) + PI2) % PI2;
    let tgtRotY = ((targetRotationY % PI2) + PI2) % PI2;

    // Find shortest path
    if (Math.abs(tgtRotY - currentRotY) > Math.PI) {
      if (tgtRotY > currentRotY) currentRotY += PI2;
      else tgtRotY += PI2;
    }

    groupRef.current.rotation.y = MathUtils.lerp(currentRotY, tgtRotY, 15 * delta);
  });

  return (
    <group ref={groupRef} position={[targetWorldPos.x, 0.5, targetWorldPos.z]}>
      {/* Robot Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.5]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      
      {/* Robot Head */}
      <mesh position={[0.1, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#c7d2fe" />
      </mesh>
      
      {/* Robot Eye (Visor) pointing "East" (positive X is local forward) */}
      <mesh position={[0.31, 0.4, 0]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Bag Indicator Light (Antenna) */}
      <mesh position={[0.1, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0.1, 0.75, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial 
          color={hasBeeper ? "#10b981" : "#f43f5e"} 
          emissive={hasBeeper ? "#10b981" : "#f43f5e"} 
          emissiveIntensity={hasBeeper ? 1.5 : 0.5} 
        />
        {hasBeeper && <pointLight color="#10b981" intensity={0.5} distance={1.5} />}
      </mesh>

      {/* Wheels */}
      <mesh position={[-0.2, -0.2, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.2, -0.2, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-0.2, -0.2, -0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.2, -0.2, -0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}
