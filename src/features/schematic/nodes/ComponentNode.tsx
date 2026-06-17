import { Handle, Position } from '@xyflow/react'
import { createElement } from 'react'
import { componentRegistry } from '../registry.tsx'

export interface ComponentNodeData {
  reference: string
  value: string
  model?: string
  componentType: string
}

function handlePos(pin: { x: number; y: number }, w: number, h: number): Position {
  if (pin.x === 0) return Position.Left
  if (pin.x >= w) return Position.Right
  if (pin.y === 0) return Position.Top
  if (pin.y >= h) return Position.Bottom
  return Position.Left
}

function handleStyle(
  pin: { x: number; y: number },
  w: number,
  h: number,
): Record<string, number | string> {
  const s: Record<string, number | string> = {
    width: 8,
    height: 8,
    background: '#6366f1',
    border: '2px solid #fff',
  }
  const pos = handlePos(pin, w, h)
  if (pos === Position.Left) {
    s.left = -4
    s.top = pin.y - 4
    s.transform = 'none'
  } else if (pos === Position.Right) {
    s.right = -4
    s.top = pin.y - 4
    s.transform = 'none'
  } else if (pos === Position.Top) {
    s.left = pin.x - 4
    s.top = -4
    s.transform = 'none'
  } else {
    s.left = pin.x - 4
    s.bottom = -4
    s.transform = 'none'
  }
  return s
}

export function ComponentNode({ data }: { data: ComponentNodeData }) {
  const reg = componentRegistry[data.componentType]
  if (!reg) {
    return <div className="bg-red-100 p-2 text-xs text-red-700">Unknown: {data.componentType}</div>
  }

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: reg.width, height: reg.height }}
    >
      <div className="absolute inset-0 text-gray-800">{createElement(reg.symbol)}</div>
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-gray-500 font-medium">
        {data.reference}
        {data.value ? ` ${data.value}` : ''}
      </div>
      {reg.pins.map((pin) => (
        <Handle
          key={pin.index}
          type="source"
          position={handlePos(pin, reg.width, reg.height)}
          id={`pin-${pin.index}`}
          style={handleStyle(pin, reg.width, reg.height)}
        />
      ))}
    </div>
  )
}
