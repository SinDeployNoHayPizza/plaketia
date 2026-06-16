import type { ReactNode } from 'react'

interface ToolbarItem {
  id: string
  icon?: string
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}

interface ToolbarProps {
  items: ToolbarItem[]
  orientation?: 'horizontal' | 'vertical'
  children?: ReactNode
}

export function Toolbar({ items, orientation = 'vertical', children }: ToolbarProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={`flex bg-gray-50 border-gray-200 gap-0.5 p-1 ${
        isHorizontal ? 'flex-row border-b' : 'flex-col border-r'
      }`}
    >
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={item.onClick}
          disabled={item.disabled}
          data-active={item.active}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors
            ${item.active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}
            ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={item.label}
        >
          {item.icon && <span className="text-base">{item.icon}</span>}
          {isHorizontal && <span>{item.label}</span>}
        </button>
      ))}
      {children}
    </div>
  )
}
