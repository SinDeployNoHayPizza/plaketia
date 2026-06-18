import type { ModelProps } from './common.tsx'
import { BodyCylinder, ThtPins } from './common.tsx'

const RADIUS = 3.5
const BODY_COLOR = '#1a5276'
const NOTCH_COLOR = '#c0392b'
const BODY_HEIGHT = 8

export function RadialCapacitorModel({ component, selected, onClick }: ModelProps) {
  const rad = (component.rotation * Math.PI) / 180

  return (
    <group position={[component.position.x, component.position.y, 0]} rotation={[0, 0, rad]}>
      <BodyCylinder
        radius={RADIUS}
        height={BODY_HEIGHT}
        selected={selected}
        color={BODY_COLOR}
        onClick={() => onClick?.(component.componentId)}
      />
      <mesh position={[-RADIUS * 0.5, 0, BODY_HEIGHT * 0.85]}>
        <boxGeometry args={[1.2, 0.3, BODY_HEIGHT * 0.2]} />
        <meshStandardMaterial color={NOTCH_COLOR} roughness={0.6} />
      </mesh>
      <ThtPins
        positions={[
          { x: -2.5, y: 0 },
          { x: 2.5, y: 0 },
        ]}
        drillDiameter={0.6}
        height={BODY_HEIGHT}
      />
    </group>
  )
}
