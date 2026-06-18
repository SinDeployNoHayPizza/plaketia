import { usePCBStore } from '@/features/pcb/store.ts'
import { ErrorBoundary } from '@/features/pcb3d/Board3D/ErrorBoundary.tsx'
import { type LayerVisibility, PCB3DCanvas } from '@/features/pcb3d/Board3D/PCB3DCanvas.tsx'
import { useCallback, useMemo, useState } from 'react'

const defaultVisibility: LayerVisibility = {
  board: true,
  copperTop: true,
  copperBottom: true,
  silkscreenTop: true,
  solderMask: true,
  components: true,
}

const layerLabels: Record<keyof LayerVisibility, string> = {
  board: 'Board',
  copperTop: 'Copper Top',
  copperBottom: 'Copper Bottom',
  silkscreenTop: 'Silkscreen',
  solderMask: 'Solder Mask',
  components: 'Components',
}

export function PCB3DViewerScreen() {
  const board = usePCBStore((s) => s.board)
  const boardData = useMemo(() => board?.toJSON() ?? null, [board])
  const selectedComponentId = usePCBStore((s) => s.selectedComponentId)
  const selectComponent = usePCBStore((s) => s.selectComponent)
  const [visibility, setVisibility] = useState<LayerVisibility>(defaultVisibility)

  const toggleLayer = useCallback((layer: keyof LayerVisibility) => {
    setVisibility((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  return (
    <div className="flex h-full w-full flex-col">
      {!boardData ? (
        <div className="flex items-center justify-center h-full text-text-secondary text-sm">
          No PCB data. Create a layout first in the PCB editor.
        </div>
      ) : (
        <div className="flex flex-1">
          <div className="w-48 border-r border-gray-700 p-3 space-y-2 bg-gray-900 shrink-0">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Layers
            </div>
            {(Object.keys(layerLabels) as (keyof LayerVisibility)[]).map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibility[key]}
                  onChange={() => toggleLayer(key)}
                  className="accent-blue-500"
                />
                {layerLabels[key]}
              </label>
            ))}
            <div className="pt-3 border-t border-gray-700 mt-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Selection
              </div>
              <div className="text-sm text-gray-300">{selectedComponentId ?? 'None'}</div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ErrorBoundary>
              <PCB3DCanvas
                boardData={boardData}
                visibility={visibility}
                selectedComponentId={selectedComponentId}
                onComponentClick={selectComponent}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}
    </div>
  )
}
