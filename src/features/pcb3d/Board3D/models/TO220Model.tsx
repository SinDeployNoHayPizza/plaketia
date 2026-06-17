import type { ModelProps } from './common.tsx'
import { BodyBox, ThtPins } from './common.tsx'

const BODY_W = 8
const BODY_D = 6
const BODY_H = 5
const BODY_COLOR = '#1a1a1a'
const TAB_COLOR = '#888888'

export function TO220Model({ component, selected, onClick }: ModelProps) {
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
      <mesh position={[-BODY_W / 2 - 0.5, 0, BODY_H / 2]}>
        <boxGeometry args={[1, BODY_D * 0.7, BODY_H]} />
        <meshStandardMaterial color={TAB_COLOR} metalness={0.8} roughness={0.2} />
      </mesh>
      <ThtPins
        positions={[
          { x: -2.54, y: 0 },
          { x: 0, y: 0 },
          { x: 2.54, y: 0 },
        ]}
        drillDiameter={0.8}
        height={BODY_H}
      />
    </group>
  )
}
