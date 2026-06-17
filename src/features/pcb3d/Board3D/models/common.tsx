import type { ReactNode } from 'react'
import type { PlacedComponent } from '../../../pcb/model/types.ts'

export interface ModelProps {
  component: PlacedComponent
  selected?: boolean
  onClick?: (componentId: string) => void
}

const PIN_COLOR = '#c0c0c0'

export function ThtPins({
  positions,
  drillDiameter,
  height,
}: { positions: { x: number; y: number }[]; drillDiameter: number; height: number }) {
  return (
    <group>
      {positions.map((pos) => (
        <mesh
          key={`${pos.x.toFixed(2)}-${pos.y.toFixed(2)}`}
          position={[pos.x, pos.y, -height / 2]}
        >
          <cylinderGeometry args={[drillDiameter / 2, drillDiameter / 2, height, 8]} />
          <meshStandardMaterial color={PIN_COLOR} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function SmdPins({
  positions,
  size,
  height,
}: { positions: { x: number; y: number }[]; size: { w: number; h: number }; height: number }) {
  return (
    <group>
      {positions.map((pos) => (
        <mesh
          key={`${pos.x.toFixed(2)}-${pos.y.toFixed(2)}`}
          position={[pos.x, pos.y, -height / 2]}
        >
          <boxGeometry args={[size.w, size.h, height]} />
          <meshStandardMaterial color={PIN_COLOR} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function BodyBox({
  size,
  height,
  selected,
  color = '#222222',
  highlightColor = '#4a90d9',
  children,
  onClick,
}: {
  size: { w: number; d: number }
  height: number
  selected?: boolean
  color?: string
  highlightColor?: string
  children?: ReactNode
  onClick?: () => void
}) {
  return (
    <group>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 3D mesh */}
      <mesh
        position={[0, 0, height / 2]}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
      >
        <boxGeometry args={[size.w, size.d, height]} />
        <meshStandardMaterial color={selected ? highlightColor : color} roughness={0.8} />
      </mesh>
      {children}
    </group>
  )
}

export function BodyCylinder({
  radius,
  height,
  selected,
  color = '#222222',
  highlightColor = '#4a90d9',
  segments = 24,
  children,
  onClick,
}: {
  radius: number
  height: number
  selected?: boolean
  color?: string
  highlightColor?: string
  segments?: number
  children?: ReactNode
  onClick?: () => void
}) {
  return (
    <group>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 3D mesh */}
      <mesh
        position={[0, 0, height / 2]}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
      >
        <cylinderGeometry args={[radius, radius, height, segments]} />
        <meshStandardMaterial color={selected ? highlightColor : color} roughness={0.8} />
      </mesh>
      {children}
    </group>
  )
}
