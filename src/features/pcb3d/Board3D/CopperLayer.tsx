import { useMemo } from 'react'
import * as THREE from 'three'
import { getFootprint } from '../../pcb/model/Footprint.ts'
import type { PCBBoardData, Point } from '../../pcb/model/types.ts'

const COPPER_COLOR = '#b87333'
const COPPER_METALNESS = 0.6
const COPPER_ROUGHNESS = 0.3
const TRACE_HEIGHT = 0.035

function createTraceShape(points: Point[], width: number): THREE.Shape {
  const shape = new THREE.Shape()
  const halfW = width / 2
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const prev = points[i > 0 ? i - 1 : i]
    const next = points[i < points.length - 1 ? i + 1 : i]
    const dx = next.x - prev.x
    const dy = next.y - prev.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const nx = (-dy / len) * halfW
    const ny = (dx / len) * halfW
    if (i === 0) {
      shape.moveTo(p.x + nx, p.y + ny)
      shape.lineTo(p.x - nx, p.y - ny)
    } else {
      shape.lineTo(p.x - nx, p.y - ny)
    }
    if (i === points.length - 1) {
      shape.lineTo(p.x - -nx, p.y - -ny)
      shape.lineTo(p.x + -nx, p.y + -ny)
    }
  }
  shape.closePath()
  return shape
}

export function CopperLayer({
  boardData,
  layer,
}: { boardData: PCBBoardData; layer: 'top' | 'bottom' }) {
  const isTop = layer === 'top'
  const zOffset = isTop ? 0 : -(boardData.thickness || 1.6)

  const tracks = useMemo(
    () => boardData.tracks.filter((t) => t.layer === layer),
    [boardData.tracks, layer],
  )

  const pads = useMemo(() => {
    const result: { x: number; y: number; w: number; h: number; shape: string }[] = []
    for (const comp of boardData.placedComponents) {
      if (comp.side !== layer) continue
      const fp = getFootprint(comp.footprintName)
      if (!fp) continue
      const rad = (comp.rotation * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      for (const pad of fp.pads) {
        result.push({
          x: comp.position.x + pad.position.x * cos - pad.position.y * sin,
          y: comp.position.y + pad.position.x * sin + pad.position.y * cos,
          w: pad.size.width,
          h: pad.size.height,
          shape: pad.shape,
        })
      }
    }
    return result
  }, [boardData.placedComponents, layer])

  const vias = useMemo(
    () =>
      boardData.vias.map((v) => ({
        x: v.position.x,
        y: v.position.y,
        r: v.outerDiameter / 2,
      })),
    [boardData.vias],
  )

  return (
    <group position={[0, 0, zOffset]}>
      {tracks.map((track) => (
        <mesh key={track.id} position={[0, 0, TRACE_HEIGHT / 2]}>
          <extrudeGeometry
            args={[
              createTraceShape(track.points, track.width),
              { depth: TRACE_HEIGHT, bevelEnabled: false },
            ]}
          />
          <meshStandardMaterial
            color={COPPER_COLOR}
            metalness={COPPER_METALNESS}
            roughness={COPPER_ROUGHNESS}
          />
        </mesh>
      ))}
      {pads.map((pad) => (
        <mesh
          key={`${pad.x.toFixed(2)}-${pad.y.toFixed(2)}`}
          position={[pad.x, pad.y, TRACE_HEIGHT / 2]}
        >
          {pad.shape === 'rect' ? (
            <boxGeometry args={[pad.w, pad.h, TRACE_HEIGHT]} />
          ) : (
            <cylinderGeometry
              args={[Math.max(pad.w, pad.h) / 2, Math.max(pad.w, pad.h) / 2, TRACE_HEIGHT, 16]}
            />
          )}
          <meshStandardMaterial
            color={COPPER_COLOR}
            metalness={COPPER_METALNESS}
            roughness={COPPER_ROUGHNESS}
          />
        </mesh>
      ))}
      {vias.map((via) => (
        <mesh key={`via-${via.x}-${via.y}`} position={[via.x, via.y, 0]}>
          <cylinderGeometry args={[via.r, via.r, boardData.thickness || 1.6, 16]} />
          <meshStandardMaterial
            color={COPPER_COLOR}
            metalness={COPPER_METALNESS}
            roughness={COPPER_ROUGHNESS}
          />
        </mesh>
      ))}
    </group>
  )
}
