import { getFootprint } from '../../pcb/model/Footprint.ts'
import type { PlacedComponent } from '../../pcb/model/types.ts'

const BODY_COLOR = '#222222'
const BODY_HIGHLIGHT = '#4a90d9'
const PIN_COLOR = '#c0c0c0'

export function ComponentModel({
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

  return (
    <group position={[component.position.x, component.position.y, 0]} rotation={[0, 0, rad]}>
      {fp.pads.map((pad) => (
        <mesh key={pad.name} position={[pad.position.x, pad.position.y, -0.5]}>
          {pad.holeDiameter > 0 ? (
            <cylinderGeometry
              args={[pad.holeDiameter / 2, pad.holeDiameter / 2, fp.height || 4, 8]}
            />
          ) : (
            <boxGeometry args={[pad.size.width, pad.size.height, 0.2]} />
          )}
          <meshStandardMaterial color={PIN_COLOR} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 3D mesh */}
      <mesh
        position={[0, 0, (fp.height || 4) / 2]}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(component.componentId)
        }}
      >
        <boxGeometry
          args={[
            fp.outline.reduce((max, p) => Math.max(max, Math.abs(p.x)), 0) * 1.5 || 4,
            fp.outline.reduce((max, p) => Math.max(max, Math.abs(p.y)), 0) * 1.5 || 2,
            fp.height || 4,
          ]}
        />
        <meshStandardMaterial color={selected ? BODY_HIGHLIGHT : BODY_COLOR} roughness={0.8} />
      </mesh>
    </group>
  )
}
