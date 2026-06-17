import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react'

export function WireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: selected ? '#6366f1' : '#374151',
        strokeWidth: 1.5,
        cursor: 'pointer',
      }}
    />
  )
}
