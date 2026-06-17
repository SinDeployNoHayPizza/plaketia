import { Grid, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { PCBBoardData } from '../../pcb/model/types.ts'
import { BoardGeometry } from './BoardGeometry.tsx'
import { ComponentModel } from './ComponentModel.tsx'
import { CopperLayer } from './CopperLayer.tsx'

export function PCB3DCanvas({ boardData }: { boardData: PCBBoardData }) {
  const size = Math.max(boardData.width, boardData.height)
  const camDist = size * 1.2

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [camDist * 0.6, -camDist * 0.6, camDist],
          fov: 45,
          near: 0.1,
          far: camDist * 10,
        }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 20]} intensity={0.8} />
        <directionalLight position={[-10, -10, 10]} intensity={0.3} />

        <Grid
          position={[boardData.width / 2, boardData.height / 2, -1]}
          args={[size * 2, size * 2]}
          cellSize={2.54}
          cellThickness={0.5}
          cellColor="#444466"
          sectionSize={10.16}
          sectionThickness={1}
          sectionColor="#666688"
          fadeDistance={size * 3}
          infiniteGrid
        />

        <BoardGeometry boardData={boardData} />
        <CopperLayer boardData={boardData} layer="top" />
        <CopperLayer boardData={boardData} layer="bottom" />

        {boardData.placedComponents.map((comp) => (
          <ComponentModel key={comp.componentId} component={comp} />
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.15}
          minDistance={1}
          maxDistance={camDist * 3}
          target={[boardData.width / 2, boardData.height / 2, 0]}
        />
      </Canvas>
    </div>
  )
}
