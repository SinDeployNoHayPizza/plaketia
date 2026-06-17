import type { DragEvent } from 'react'
import { createElement } from 'react'
import { componentCategories, componentRegistry, vddRegistration } from '../registry.tsx'

const categoryLabels: Record<string, string> = {
  passive: 'Passive',
  active: 'Active',
  source: 'Sources',
}

export function ComponentPalette() {
  const onDragStart = (event: DragEvent, componentType: string) => {
    event.dataTransfer.setData('application/reactflow', componentType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex flex-col gap-3 p-2 text-xs">
      {Object.entries(componentCategories).map(([category, types]) => (
        <div key={category}>
          <div className="font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
            {categoryLabels[category] ?? category}
          </div>
          {types.map((type) => {
            const reg = componentRegistry[type]
            if (!reg) return null
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing hover:bg-indigo-50 transition-colors"
              >
                <div className="w-8 h-6 text-gray-700 shrink-0 flex items-center justify-center">
                  <svg
                    aria-hidden={true}
                    viewBox={`0 0 ${reg.width} ${reg.height}`}
                    width="28"
                    height="20"
                    overflow="visible"
                  >
                    <g transform={`scale(${Math.min(28 / reg.width, 20 / reg.height)})`}>
                      {createElement(reg.symbol)}
                    </g>
                  </svg>
                </div>
                <span className="text-gray-700 truncate">{reg.label}</span>
              </div>
            )
          })}
        </div>
      ))}
      <div className="border-t border-gray-200 pt-2 mt-1">
        <div className="font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
          Special
        </div>
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'ground')}
          className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing hover:bg-indigo-50 transition-colors"
        >
          <div className="w-8 h-6 text-gray-700 shrink-0 flex items-center justify-center">
            <svg aria-hidden={true} viewBox="0 0 30 28" width="20" height="18" overflow="visible">
              <line x1="15" y1="0" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" />
              <line x1="5" y1="10" x2="25" y2="10" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5" />
              <line x1="11" y1="20" x2="19" y2="20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-gray-700">Ground</span>
        </div>
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'vdd')}
          className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing hover:bg-indigo-50 transition-colors"
        >
          <div className="w-8 h-6 text-gray-700 shrink-0 flex items-center justify-center">
            <svg aria-hidden={true} viewBox="0 0 30 40" width="20" height="18" overflow="visible">
              {createElement(vddRegistration.symbol)}
            </svg>
          </div>
          <span className="text-gray-700">VDD</span>
        </div>
      </div>
    </div>
  )
}
