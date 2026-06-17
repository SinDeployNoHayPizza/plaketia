import * as THREE from 'three'
import type { PCBBoardData } from '../../pcb/model/types.ts'

const MASK_COLOR = '#1a7a1a'
const MASK_OPACITY = 0.15
const MASK_HEIGHT = 0.01

export function SolderMask({
  boardData,
  layer,
}: { boardData: PCBBoardData; layer: 'top' | 'bottom' }) {
  const zOffset =
    layer === 'top' ? -MASK_HEIGHT / 2 : -(boardData.thickness || 1.6) - MASK_HEIGHT / 2

  return (
    <group position={[0, 0, zOffset]}>
      <mesh position={[boardData.width / 2, boardData.height / 2, 0]}>
        <planeGeometry args={[boardData.width, boardData.height]} />
        <meshBasicMaterial
          color={MASK_COLOR}
          transparent
          opacity={MASK_OPACITY}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
