import * as THREE from 'three'
import type { PCBBoardData } from '../../pcb/model/types.ts'

const BOARD_COLOR = '#1b5e20'
const BOARD_TOP_COLOR = '#2e7d32'

export function BoardGeometry({ boardData }: { boardData: PCBBoardData }) {
  const { width, height, thickness } = boardData

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={BOARD_TOP_COLOR}
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh receiveShadow position={[width / 2, height / 2, -thickness / 2]}>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}
