import type { ReactNode } from 'react'

interface AppShellProps {
  sidebar?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  statusBar?: ReactNode
}

export function AppShell({ sidebar, toolbar, children, statusBar }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {statusBar && (
        <div className="flex items-center px-3 py-1 bg-gray-800 text-white text-xs gap-2">
          {statusBar}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && <div className="flex-shrink-0">{sidebar}</div>}
        <div className="flex flex-1 overflow-hidden">
          {toolbar && <div className="flex-shrink-0">{toolbar}</div>}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  )
}
