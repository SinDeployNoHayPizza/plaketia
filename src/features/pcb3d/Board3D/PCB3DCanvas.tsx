import { Grid, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { PCBBoardData } from '../../pcb/model/types.ts'
import { BoardGeometry } from './BoardGeometry.tsx'
import { ComponentModel } from './ComponentModel.tsx'
import { CopperLayer } from './CopperLayer.tsx'
import { Silkscreen } from './Silkscreen.tsx'
import { SolderMask } from './SolderMask.tsx'

export interface LayerVisibility {
  board: boolean
  copperTop: boolean
  copperBottom: boolean
  silkscreenTop: boolean
  solderMask: boolean
  components: boolean
}

export function PCB3DCanvas({
  boardData,
  visibility,
  selectedComponentId,
  onComponentClick,
}: {
  boardData: PCBBoardData
  visibility: LayerVisibility
  selectedComponentId?: string | null
  onComponentClick?: (componentId: string | null) => void
}) {
  const size = Math.max(boardData.width, boardData.height)
  const camDist = size * 1.2

  return (
    <div className="w-full h-full">
      <Canvas
        onPointerMissed={() => onComponentClick?.(null)}
        camera={{
          position: [camDist * 0.6, -camDist * 0.6, camDist],
          fov: 45,
          near: 0.1,
          far: camDist * 10,
        }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        dpr={[1, 2]}
        onCreated={(state) => console.log('[3D] Canvas ready', state.gl.info)}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 20]} intensity={0.8} />
        <directionalLight position={[-10, -10, 10]} intensity={0.3} />

        <Grid
          position={[boardData.width / 2, boardData.height / 2, -(boardData.thickness || 1.6) - 1]}
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

        {visibility.board && <BoardGeometry boardData={boardData} />}
        {visibility.copperTop && <CopperLayer boardData={boardData} layer="top" />}
        {visibility.copperBottom && <CopperLayer boardData={boardData} layer="bottom" />}
        {visibility.solderMask && <SolderMask boardData={boardData} layer="top" />}
        {visibility.solderMask && <SolderMask boardData={boardData} layer="bottom" />}
        {visibility.silkscreenTop && <Silkscreen boardData={boardData} />}
        {visibility.components &&
          boardData.placedComponents.map((comp) => (
            <ComponentModel
              key={comp.componentId}
              component={comp}
              selected={comp.componentId === selectedComponentId}
              onClick={onComponentClick}
            />
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
