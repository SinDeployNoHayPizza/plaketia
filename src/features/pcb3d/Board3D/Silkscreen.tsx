import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { getFootprint } from '../../pcb/model/Footprint.ts'
import type { PCBBoardData } from '../../pcb/model/types.ts'

const SILKSCREEN_Z = 0.05

export function Silkscreen({ boardData }: { boardData: PCBBoardData }) {
  const outlines = useMemo(() => {
    const result: { id: string; pts: [number, number, number][] }[] = []
    for (const comp of boardData.placedComponents) {
      if (comp.side !== 'top') continue
      const fp = getFootprint(comp.footprintName)
      if (!fp) continue
      const rad = (comp.rotation * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      const pts: [number, number, number][] = fp.outline.map((p) => [
        comp.position.x + p.x * cos - p.y * sin,
        comp.position.y + p.x * sin + p.y * cos,
        SILKSCREEN_Z,
      ])
      pts.push(pts[0])
      result.push({ id: comp.componentId, pts })
    }
    return result
  }, [boardData.placedComponents])

  return (
    <group>
      {outlines.map(({ id, pts }) => (
        <Line key={id} points={pts} color="white" lineWidth={1} />
      ))}
    </group>
  )
}
