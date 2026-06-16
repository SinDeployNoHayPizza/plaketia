import type { ReactNode } from 'react'

interface SidePanelProps {
  side: 'left' | 'right'
  width?: number
  children: ReactNode
  collapsed?: boolean
  onToggle?: () => void
  title?: string
}

export function SidePanel({
  side,
  width = 240,
  children,
  collapsed = false,
  title,
}: SidePanelProps) {
  return (
    <div
      className={`flex flex-col border-gray-200 bg-white overflow-y-auto ${
        side === 'left' ? 'border-r' : 'border-l'
      }`}
      style={{ width: collapsed ? 0 : width, minWidth: collapsed ? 0 : width }}
    >
      {title && (
        <div className="px-3 py-2 border-b border-gray-200 font-semibold text-sm text-gray-700">
          {title}
        </div>
      )}
      <div className="flex-1 p-2">{children}</div>
    </div>
  )
}
