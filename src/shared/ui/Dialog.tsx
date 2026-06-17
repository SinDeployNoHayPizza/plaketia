import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-text-primary/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      />
      <div className="relative bg-silk rounded-sm shadow-xl w-full max-w-md mx-4 border border-trace">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-trace">
          <h2 className="font-display text-lg font-bold tracking-wide text-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-trace bg-substrate/30 rounded-b-sm">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
