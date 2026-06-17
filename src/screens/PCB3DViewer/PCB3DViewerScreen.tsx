import { usePCBStore } from '@/features/pcb/store.ts'
import { PCB3DCanvas } from '@/features/pcb3d/Board3D/PCB3DCanvas.tsx'

export function PCB3DViewerScreen() {
  const boardData = usePCBStore((s) => s.board?.toJSON())

  return (
    <div className="flex h-full w-full flex-col">
      {!boardData ? (
        <div className="flex items-center justify-center h-full text-text-secondary text-sm">
          No PCB data. Create a layout first in the PCB editor.
        </div>
      ) : (
        <PCB3DCanvas boardData={boardData} />
      )}
    </div>
  )
}
