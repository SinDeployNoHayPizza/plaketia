import type { ModelProps } from './common.tsx'
import { BodyBox, ThtPins } from './common.tsx'

const BODY_W = 7
const BODY_D = 7
const BODY_H = 4
const BODY_COLOR = '#1a1a1a'
const PIN_SPACING = 2.54
const ROW_X = 3.81
const PIN_COUNT = 4

export function DIP8Model({ component, selected, onClick }: ModelProps) {
  const rad = (component.rotation * Math.PI) / 180

  const leftPins = Array.from({ length: PIN_COUNT }, (_, i) => ({
    x: -ROW_X,
    y: i * PIN_SPACING - ((PIN_COUNT - 1) * PIN_SPACING) / 2,
  }))
  const rightPins = Array.from({ length: PIN_COUNT }, (_, i) => ({
    x: ROW_X,
    y: i * PIN_SPACING - ((PIN_COUNT - 1) * PIN_SPACING) / 2,
  }))

  return (
    <group position={[component.position.x, component.position.y, 0]} rotation={[0, 0, rad]}>
      <BodyBox
        size={{ w: BODY_W, d: BODY_D }}
        height={BODY_H}
        selected={selected}
        color={BODY_COLOR}
        onClick={() => onClick?.(component.componentId)}
      />
      <mesh position={[0, -BODY_D / 2 - 0.3, BODY_H - 0.5]}>
        <boxGeometry args={[BODY_W * 0.6, 0.6, 1.5]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      <ThtPins positions={[...leftPins, ...rightPins]} drillDiameter={0.6} height={BODY_H} />
    </group>
  )
}
