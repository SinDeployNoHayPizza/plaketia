import type { ModelProps } from './common.tsx'
import { BodyBox } from './common.tsx'

const BODY_W = 2.5
const BODY_D = 1.5
const BODY_H = 1.5
const BODY_COLOR = '#1a1a1a'
const END_CAP_COLOR = '#c0c0c0'

export function SMD0805Model({ component, selected, onClick }: ModelProps) {
  const rad = (component.rotation * Math.PI) / 180

  return (
    <group position={[component.position.x, component.position.y, 0]} rotation={[0, 0, rad]}>
      <BodyBox
        size={{ w: BODY_W, d: BODY_D }}
        height={BODY_H}
        selected={selected}
        color={BODY_COLOR}
        onClick={() => onClick?.(component.componentId)}
      />
      <mesh position={[-BODY_W / 2 - 0.4, 0, BODY_H / 2]}>
        <boxGeometry args={[0.8, BODY_D + 0.3, BODY_H]} />
        <meshStandardMaterial color={END_CAP_COLOR} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[BODY_W / 2 + 0.4, 0, BODY_H / 2]}>
        <boxGeometry args={[0.8, BODY_D + 0.3, BODY_H]} />
        <meshStandardMaterial color={END_CAP_COLOR} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}
