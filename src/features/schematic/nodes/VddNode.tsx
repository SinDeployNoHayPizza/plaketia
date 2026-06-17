import { Handle, Position } from '@xyflow/react'
import { createElement } from 'react'
import { VddSymbol } from '../registry.tsx'
import type { ComponentNodeData } from './ComponentNode.tsx'

export function VddNode({ data }: { data: ComponentNodeData }) {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: 30, height: 40 }}
    >
      <div className="absolute inset-0 text-gray-800">{createElement(VddSymbol)}</div>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className="whitespace-nowrap text-[9px] text-red-600 font-medium">
          {data.reference}
        </span>
        {data.value ? (
          <span className="whitespace-nowrap text-[8px] text-gray-500">{data.value}</span>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="pin-0"
        style={{
          left: 11,
          bottom: -4,
          width: 8,
          height: 8,
          background: '#dc2626',
          border: '2px solid #fff',
          transform: 'none',
        }}
      />
    </div>
  )
}
