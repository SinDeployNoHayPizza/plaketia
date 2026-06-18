import type { ModelProps } from './common.tsx'
import { BodyBox, SmdPins } from './common.tsx'

const BODY_W = 2.5
const BODY_D = 2.5
const BODY_H = 1.1
const BODY_COLOR = '#1a1a1a'
const PITCH = 0.95

export function SOT23Model({ component, selected, onClick }: ModelProps) {
  const rad = (component.rotation * Math.PI) / 180

  const topPins = [
    { x: -PITCH, y: 0.95 },
    { x: 0, y: 0.95 },
    { x: PITCH, y: 0.95 },
  ]
  const botPins = [
    { x: -PITCH, y: -0.95 },
    { x: 0, y: -0.95 },
    { x: PITCH, y: -0.95 },
  ]

  return (
    <group position={[component.position.x, component.position.y, 0]} rotation={[0, 0, rad]}>
      <BodyBox
        size={{ w: BODY_W, d: BODY_D }}
        height={BODY_H}
        selected={selected}
        color={BODY_COLOR}
        onClick={() => onClick?.(component.componentId)}
      />
      <SmdPins positions={[...topPins, ...botPins]} size={{ w: 0.6, h: 0.9 }} height={BODY_H} />
    </group>
  )
}
