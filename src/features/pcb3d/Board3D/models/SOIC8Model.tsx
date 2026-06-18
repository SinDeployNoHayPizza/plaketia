import type { ModelProps } from './common.tsx'
import { BodyBox, SmdPins } from './common.tsx'

const BODY_W = 5
const BODY_D = 4
const BODY_H = 1.75
const BODY_COLOR = '#1a1a1a'
const PIN_PITCH = 1.27
const ROW_X = 2.95
const PIN_COUNT = 4

export function SOIC8Model({ component, selected, onClick }: ModelProps) {
  const rad = (component.rotation * Math.PI) / 180

  const leftPins = Array.from({ length: PIN_COUNT }, (_, i) => ({
    x: -ROW_X,
    y: i * PIN_PITCH - ((PIN_COUNT - 1) * PIN_PITCH) / 2,
  }))
  const rightPins = Array.from({ length: PIN_COUNT }, (_, i) => ({
    x: ROW_X,
    y: i * PIN_PITCH - ((PIN_COUNT - 1) * PIN_PITCH) / 2,
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
      <SmdPins positions={[...leftPins, ...rightPins]} size={{ w: 0.6, h: 1.8 }} height={BODY_H} />
    </group>
  )
}
