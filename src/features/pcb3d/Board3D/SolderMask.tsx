import * as THREE from 'three'
import type { PCBBoardData } from '../../pcb/model/types.ts'

const MASK_COLOR = '#1a7a1a'
const MASK_OPACITY = 0.12

export function SolderMask({
  boardData,
  layer,
}: { boardData: PCBBoardData; layer: 'top' | 'bottom' }) {
  const zOffset = layer === 'top' ? 0.05 : -(boardData.thickness || 1.6) - 0.05

  return (
    <mesh position={[boardData.width / 2, boardData.height / 2, zOffset]}>
      <planeGeometry args={[boardData.width, boardData.height]} />
      <meshStandardMaterial
        color={MASK_COLOR}
        transparent
        opacity={MASK_OPACITY}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={0.6}
      />
    </mesh>
  )
}
