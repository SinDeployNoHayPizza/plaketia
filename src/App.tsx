import { usePCBStore } from '@/features/pcb/store.ts'
import { useState } from 'react'
import { PCB3DViewerScreen } from './screens/PCB3DViewer/PCB3DViewerScreen.tsx'
import { PCBLayoutScreen } from './screens/PCBLayout/PCBLayoutScreen.tsx'
import { ProjectManagerScreen } from './screens/ProjectManager/ProjectManagerScreen.tsx'
import { SchematicEditorScreen } from './screens/SchematicEditor/SchematicEditorScreen.tsx'

type Screen = 'schematic' | 'pcb-layout' | 'pcb-3d'

const screenLabels: Record<Screen, string> = {
  schematic: 'Schematic Editor',
  'pcb-layout': 'PCB Layout',
  'pcb-3d': '3D Viewer',
}

export function App() {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('schematic')
  const board = usePCBStore((s) => s.board)

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
          <div className="flex gap-1">
            {(Object.keys(screenLabels) as Screen[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScreen(s)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  screen === s
                    ? 'bg-copper text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {screenLabels[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
          {board && <span>{board.tracks.length} traces</span>}
          <span>{projectId}</span>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        {screen === 'schematic' && <SchematicEditorScreen />}
        {screen === 'pcb-layout' && <PCBLayoutScreen />}
        {screen === 'pcb-3d' && <PCB3DViewerScreen />}
      </div>
    </div>
  )
}
