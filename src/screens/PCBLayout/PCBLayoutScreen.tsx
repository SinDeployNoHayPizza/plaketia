import { useCircuitStore } from '@/features/circuit/store.ts'
import { PCBCanvas } from '@/features/pcb/canvas/PCBCanvas.tsx'
import { generateBOM } from '@/features/pcb/export/bom.ts'
import { exportGerber } from '@/features/pcb/export/gerber.ts'
import { getFootprint, suggestFootprint } from '@/features/pcb/model/Footprint.ts'
import type { Airwire, PlacedComponent, Point } from '@/features/pcb/model/types.ts'
import { usePCBStore } from '@/features/pcb/store.ts'
import { useCallback, useEffect, useMemo } from 'react'

export function PCBLayoutScreen() {
  const board = usePCBStore((s) => s.board)
  const createBoard = usePCBStore((s) => s.createBoard)
  const placeComponent = usePCBStore((s) => s.placeComponent)
  const selectedComponentId = usePCBStore((s) => s.selectedComponentId)
  const selectComponent = usePCBStore((s) => s.selectComponent)
  const drcViolations = usePCBStore((s) => s.drcViolations)
  const runDRC = usePCBStore((s) => s.runDRC)

  const circuitComponents = useCircuitStore((s) => s.components)
  const circuit = useCircuitStore((s) => s.circuit)

  useEffect(() => {
    if (!board) {
      createBoard(100, 80)
    }
  }, [board, createBoard])

  const handlePlaceAll = useCallback(() => {
    if (!board) return
    const spacing = 15
    const perRow = Math.ceil(Math.sqrt(circuitComponents.size))
    let idx = 0
    for (const [id, comp] of circuitComponents) {
      const fpName = suggestFootprint(comp.type)
      const row = Math.floor(idx / perRow)
      const col = idx % perRow
      const placed: PlacedComponent = {
        componentId: id,
        reference: comp.reference,
        type: comp.type,
        footprintName: fpName,
        position: { x: 10 + col * spacing, y: 10 + row * spacing },
        rotation: 0,
        side: 'top',
        locked: false,
      }
      placeComponent(placed)
      idx++
    }
  }, [board, circuitComponents, placeComponent])

  const handleExport = useCallback(() => {
    if (!board) return
    const files = exportGerber(board.toJSON())
    const name = board.metadata.name.replace(/\s+/g, '_')

    const entries = [
      { content: files.topCopper, ext: '.GTL', desc: 'Top Copper' },
      { content: files.bottomCopper, ext: '.GBL', desc: 'Bottom Copper' },
      { content: files.topSilkscreen, ext: '.GTO', desc: 'Top Silkscreen' },
      { content: files.outline, ext: '.GKO', desc: 'Board Outline' },
      { content: files.drill, ext: '.TXT', desc: 'Drill' },
    ]

    for (const entry of entries) {
      const blob = new Blob([entry.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}${entry.ext}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [board])

  const handleExportBOM = useCallback(() => {
    if (!board) return
    const csv = generateBOM(board.placedComponents, (id) => {
      const comp = circuitComponents.get(id)
      return comp?.value ?? ''
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${board.metadata.name.replace(/\s+/g, '_')}_BOM.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [board, circuitComponents])

  const unplacedComponents = useMemo(() => {
    const placedIds = new Set(board?.placedComponents.map((c) => c.componentId) ?? [])
    return [...circuitComponents.entries()].filter(([id]) => !placedIds.has(id))
  }, [circuitComponents, board?.placedComponents])

  const airwires = useMemo((): Airwire[] => {
    if (!board || !circuit) return []
    const result: Airwire[] = []
    const netsWithTracks = new Set(board.tracks.map((t) => t.netId))
    const visited = new Set<string>()

    for (const conn of circuit.connections) {
      const key = `${conn.nodeId}-${conn.componentId}-${conn.pinIndex}`
      if (visited.has(key)) continue
      visited.add(key)

      if (netsWithTracks.has(conn.nodeId)) continue

      const sameNet = circuit.getConnectionsForNode(conn.nodeId)
      if (sameNet.length < 2) continue

      const compA = board.placedComponents.find((c) => c.componentId === conn.componentId)
      if (!compA) continue
      const fpA = getFootprint(compA.footprintName)
      if (!fpA || conn.pinIndex >= fpA.pads.length) continue
      const padA = fpA.pads[conn.pinIndex]
      const radA = (compA.rotation * Math.PI) / 180
      const start: Point = {
        x: compA.position.x + padA.position.x * Math.cos(radA) - padA.position.y * Math.sin(radA),
        y: compA.position.y + padA.position.x * Math.sin(radA) + padA.position.y * Math.cos(radA),
      }

      for (const other of sameNet) {
        const otherKey = `${other.nodeId}-${other.componentId}-${other.pinIndex}`
        if (otherKey === key || visited.has(otherKey)) continue

        const compB = board.placedComponents.find((c) => c.componentId === other.componentId)
        if (!compB) continue
        const fpB = getFootprint(compB.footprintName)
        if (!fpB || other.pinIndex >= fpB.pads.length) continue
        const padB = fpB.pads[other.pinIndex]
        const radB = (compB.rotation * Math.PI) / 180
        const end: Point = {
          x: compB.position.x + padB.position.x * Math.cos(radB) - padB.position.y * Math.sin(radB),
          y: compB.position.y + padB.position.x * Math.sin(radB) + padB.position.y * Math.cos(radB),
        }

        result.push({ start, end, netId: conn.nodeId })
      }
    }

    return result
  }, [board, circuit])

  return (
    <div className="flex h-full w-full">
      <div className="w-64 flex-shrink-0 border-r border-trace bg-surface flex flex-col">
        <div className="px-3 py-2 border-b border-trace">
          <h2 className="font-body text-sm font-semibold text-text-primary">PCB Layout</h2>
        </div>

        <div className="px-3 py-2 border-b border-trace flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePlaceAll}
            disabled={unplacedComponents.length === 0}
            className="w-full px-3 py-1.5 bg-copper text-white rounded text-xs font-medium hover:bg-copper-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Place All ({unplacedComponents.length})
          </button>

          <button
            type="button"
            onClick={runDRC}
            className="w-full px-3 py-1.5 bg-surface border border-trace text-text-primary rounded text-xs font-medium hover:bg-trace transition-colors"
          >
            Run DRC
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="w-full px-3 py-1.5 bg-copper text-white rounded text-xs font-medium hover:bg-copper-dark transition-colors"
          >
            Export Gerber
          </button>

          <button
            type="button"
            onClick={handleExportBOM}
            disabled={board?.placedComponents.length === 0}
            className="w-full px-3 py-1.5 bg-surface border border-trace text-text-primary rounded text-xs font-medium hover:bg-trace transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export BOM (CSV)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <h3 className="font-body text-[10px] font-medium text-text-secondary mb-2 uppercase tracking-wide">
              Components
            </h3>
            {circuitComponents.size === 0 && (
              <div className="text-[10px] text-text-secondary italic">
                No components in schematic
              </div>
            )}
            {[...circuitComponents.entries()].map(([id, comp]) => {
              const placed = board?.placedComponents.find((c) => c.componentId === id)
              return (
                <div
                  key={id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                    selectedComponentId === id
                      ? 'bg-copper/10 border border-copper/30'
                      : 'hover:bg-trace'
                  }`}
                  onClick={() => selectComponent(id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') selectComponent(id)
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-text-primary">{comp.reference}</div>
                    <div className="text-[9px] text-text-secondary truncate">{comp.type}</div>
                  </div>
                  <div className="text-[9px] text-text-secondary">{placed ? 'Placed' : '-'}</div>
                </div>
              )
            })}
          </div>
        </div>

        {drcViolations.length > 0 && (
          <div className="border-t border-trace px-3 py-2 max-h-32 overflow-y-auto">
            <h3 className="font-body text-[10px] font-medium text-red-600 mb-1 uppercase">
              DRC Violations ({drcViolations.length})
            </h3>
            {drcViolations.map((v) => (
              <div
                key={`${v.type}-${v.message}`}
                className="text-[9px] font-mono text-red-500 leading-tight mb-0.5"
              >
                {v.severity === 'error' ? '●' : '○'} {v.message}
              </div>
            ))}
          </div>
        )}

        <div className="px-3 py-2 border-t border-trace text-[10px] text-text-secondary">
          {board && (
            <span>
              {board.width} × {board.height} mm | {board.placedComponents.length} placed |{' '}
              {board.tracks.length} traces
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-[#1a1a2e]">
        {!board ? (
          <div className="flex items-center justify-center h-full text-text-secondary text-sm">
            Creating board...
          </div>
        ) : (
          <PCBCanvas airwires={airwires} />
        )}
      </div>
    </div>
  )
}
