import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { RobotModel } from './RobotModel';
import { GridMap } from './GridMap';

export function Scene() {
  return (
    <Canvas shadows alpha={true} className="w-full h-full">
      <PerspectiveCamera makeDefault position={[5, 8, 8]} fov={50} />
      <OrbitControls target={[0, 0, 0]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />

      <GridMap />
      <RobotModel />
      
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      <Environment preset="city" />
    </Canvas>
  );
}
