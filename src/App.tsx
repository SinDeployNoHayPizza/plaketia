import { useState } from 'react'
import { ProjectManagerScreen } from './screens/ProjectManager/ProjectManagerScreen.tsx'
import { SchematicEditorScreen } from './screens/SchematicEditor/SchematicEditorScreen.tsx'

export function App() {
  const [projectId, setProjectId] = useState<string | null>(null)

  if (!projectId) {
    return <ProjectManagerScreen onOpenProject={(id) => setProjectId(id)} />
  }

  return (
    <div className="h-full w-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-1.5 bg-silk border-b border-trace text-xs shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProjectId(null)}
            className="font-body text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            &larr; Projects
          </button>
          <span className="text-trace">|</span>
          <span className="font-display text-sm font-bold tracking-wide text-text-primary">
            Schematic Editor
          </span>
        </div>
        <div className="font-mono text-xs text-text-secondary">{projectId}</div>
      </header>
      <div className="flex-1 min-h-0">
        <SchematicEditorScreen />
      </div>
    </div>
  )
}
