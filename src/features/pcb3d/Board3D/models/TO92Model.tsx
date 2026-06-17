import type { ModelProps } from './common.tsx'
import { BodyBox, ThtPins } from './common.tsx'

const BODY_W = 4
const BODY_D = 3.5
const BODY_H = 4.5
const BODY_COLOR = '#1a1a1a'

export function TO92Model({ component, selected, onClick }: ModelProps) {
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
      <mesh position={[BODY_W / 2 + 0.2, 0, BODY_H / 2]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      <ThtPins
        positions={[
          { x: -1.27, y: 1.27 },
          { x: -1.27, y: 0 },
          { x: -1.27, y: -1.27 },
        ]}
        drillDiameter={0.5}
        height={BODY_H}
      />
    </group>
  )
}
