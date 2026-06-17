import { getFootprint } from '../../../pcb/model/Footprint.ts'
import type { PlacedComponent } from '../../../pcb/model/types.ts'
import { BodyBox } from './common.tsx'

export function GenericModel({
  component,
  selected,
  onClick,
}: {
  component: PlacedComponent
  selected?: boolean
  onClick?: (componentId: string) => void
}) {
  const fp = getFootprint(component.footprintName)
  if (!fp) return null

  const rad = (component.rotation * Math.PI) / 180

  const bodyW = fp.outline.reduce((max, p) => Math.max(max, Math.abs(p.x)), 0) * 1.5 || 4
  const bodyD = fp.outline.reduce((max, p) => Math.max(max, Math.abs(p.y)), 0) * 1.5 || 2

  return (
    <group position={[component.position.x, component.position.y, 0]} rotation={[0, 0, rad]}>
      <BodyBox
        size={{ w: bodyW, d: bodyD }}
        height={fp.height || 4}
        selected={selected}
        onClick={() => onClick?.(component.componentId)}
      />
    </group>
  )
}
