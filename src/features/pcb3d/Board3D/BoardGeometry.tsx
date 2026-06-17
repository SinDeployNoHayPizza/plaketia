import { useMemo } from 'react'
import * as THREE from 'three'
import type { PCBBoardData } from '../../pcb/model/types.ts'

const BOARD_COLOR = '#1b5e20'
const BOARD_TOP_COLOR = '#2e7d32'

export function BoardGeometry({ boardData }: { boardData: PCBBoardData }) {
  const { width, height, thickness } = boardData

  const center = useMemo(
    () => ({
      x: boardData.boardOutline.reduce((s, p) => s + p.x, 0) / boardData.boardOutline.length,
      y: boardData.boardOutline.reduce((s, p) => s + p.y, 0) / boardData.boardOutline.length,
    }),
    [boardData.boardOutline],
  )

  return (
    <group position={[-center.x, -center.y, -thickness / 2]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={BOARD_TOP_COLOR}
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh receiveShadow position={[0, 0, -thickness / 2]}>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}
