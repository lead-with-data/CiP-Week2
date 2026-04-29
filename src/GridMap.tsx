import { useStore, LEVELS } from './store';
import { gridToWorld, CELL_SIZE } from './RobotModel';

function BeeperStack({ x, z, count }: { x: number; z: number; count: number }) {
  const gridSize = useStore((state) => state.gridSize);
  const worldPos = gridToWorld(x, z, gridSize);

  // Render a visual stack of beepers (diamonds)
  const beepers = [];
  for (let i = 0; i < count; i++) {
    beepers.push(
      <mesh key={i} position={[worldPos.x, i * 0.2 + 0.1, worldPos.z]} castShadow receiveShadow>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
    );
  }

  return <group>{beepers}</group>;
}

export function GridMap() {
  const gridSize = useStore((state) => state.gridSize);
  const beepers = useStore((state) => state.grid.beepers);
  const currentLevelId = useStore((state) => state.currentLevel);

  const floorSize = gridSize * CELL_SIZE;

  // Generate crosses for the grid specifically matching the visual style
  const gridLines = [];
  const offset = -gridSize / 2 + CELL_SIZE / 2;
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      gridLines.push(
        <mesh key={`grid-${x}-${z}`} position={[x * CELL_SIZE + offset, 0.01, z * CELL_SIZE + offset]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
          {/* A simple cross can be easily drawn by using two thin intersecting rectangles, but let's just use standard edges or a dot */}
          <meshBasicMaterial color="#999999" />
        </mesh>
      );
    }
  }

  const currentLevel = LEVELS[currentLevelId as keyof typeof LEVELS];
  const homePos = currentLevel ? gridToWorld(currentLevel.robot.x, currentLevel.robot.z, gridSize) : null;

  return (
    <group>
      {/* The Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial color="#f0fdf4" />
      </mesh>

      {/* Home Tile */}
      {homePos && (
         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[homePos.x, 0, homePos.z]} receiveShadow>
           <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
           <meshStandardMaterial color="#bbf7d0" /> 
         </mesh>
      )}

      {/* Grid cross markers */}
      {gridLines}

      {/* Render Beepers */}
      {Object.entries(beepers).map(([key, count]) => {
        const [x, z] = key.split(',').map(Number);
        return count > 0 ? <BeeperStack key={key} x={x} z={z} count={count} /> : null;
      })}
    </group>
  );
}
