import { Handle, Position } from '@xyflow/react'
import { createElement } from 'react'
import { GroundSymbol } from '../registry.tsx'

export function GroundNode() {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: 30, height: 40 }}
    >
      <div className="absolute inset-0 text-gray-800">{createElement(GroundSymbol)}</div>
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-gray-500 font-medium">
        GND
      </div>
      <Handle
        type="source"
        position={Position.Top}
        id="pin-0"
        style={{
          left: 11,
          top: -4,
          width: 8,
          height: 8,
          background: '#6366f1',
          border: '2px solid #fff',
          transform: 'none',
        }}
      />
    </div>
  )
}
