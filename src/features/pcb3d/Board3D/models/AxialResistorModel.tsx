import type { ModelProps } from './common.tsx'
import { BodyBox, ThtPins } from './common.tsx'

const BODY_COLOR = '#d4a574'
const BAND_COLOR = '#8b4513'
const LEAD_LENGTH = 3
const BODY_HALF_LENGTH = 4

export function AxialResistorModel({ component, selected, onClick }: ModelProps) {
  const rad = (component.rotation * Math.PI) / 180

  return (
    <group position={[component.position.x, component.position.y, 0]} rotation={[0, 0, rad]}>
      <BodyBox
        size={{ w: BODY_HALF_LENGTH * 2, d: 4 }}
        height={4}
        selected={selected}
        color={BODY_COLOR}
        onClick={() => onClick?.(component.componentId)}
      />
      <mesh position={[-BODY_HALF_LENGTH + 0.5, 0, 2]}>
        <boxGeometry args={[1, 4.2, 4.2]} />
        <meshStandardMaterial color={BAND_COLOR} roughness={0.8} />
      </mesh>
      <mesh position={[BODY_HALF_LENGTH - 0.5, 0, 2]}>
        <boxGeometry args={[1, 4.2, 4.2]} />
        <meshStandardMaterial color={BAND_COLOR} roughness={0.8} />
      </mesh>
      <ThtPins
        positions={[
          { x: -BODY_HALF_LENGTH - LEAD_LENGTH / 2, y: 0 },
          { x: BODY_HALF_LENGTH + LEAD_LENGTH / 2, y: 0 },
        ]}
        drillDiameter={0.6}
        height={5}
      />
    </group>
  )
}
