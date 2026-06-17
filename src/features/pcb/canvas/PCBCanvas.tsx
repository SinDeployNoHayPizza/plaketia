import { useCallback, useRef } from 'react'
import { getFootprint } from '../model/Footprint.ts'
import type { Point } from '../model/types.ts'
import { usePCBStore } from '../store.ts'

const GRID_SIZE = 2.54
const BOARD_COLOR = '#1b5e20'
const COPPER_COLOR = '#b87333'
const SILK_COLOR = '#ffffff'
const TRACE_COLOR = '#b87333'
const VIA_COLOR = '#8b6914'
const GRID_COLOR = '#e0e0e0'
const SELECT_COLOR = '#4f8ff7'

function FootprintLayer({
  component,
  selected,
}: {
  component: {
    componentId: string
    reference: string
    footprintName: string
    position: Point
    rotation: number
    side: 'top' | 'bottom'
  }
  selected: boolean
}) {
  const fp = getFootprint(component.footprintName)
  if (!fp) return null

  const cx = component.position.x
  const cy = component.position.y

  const transform = `translate(${cx}, ${cy}) rotate(${component.rotation})`

  return (
    <g transform={transform}>
      {selected && (
        <rect
          x={fp.outline[0]?.x ?? -5}
          y={fp.outline[0]?.y ?? -5}
          width={Math.abs((fp.outline[2]?.x ?? 10) - (fp.outline[0]?.x ?? 0))}
          height={Math.abs((fp.outline[2]?.y ?? 10) - (fp.outline[0]?.y ?? 0))}
          fill="none"
          stroke={SELECT_COLOR}
          strokeWidth={0.15}
          strokeDasharray="0.5 0.3"
          rx={0.3}
        />
      )}

      <polygon
        points={fp.outline.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={SILK_COLOR}
        strokeWidth={0.15}
      />

      <text
        x={0}
        y={(fp.outline[0]?.y ?? 0) - 0.5}
        textAnchor="middle"
        fill={SILK_COLOR}
        fontSize={1}
        fontFamily="monospace"
      >
        {component.reference}
      </text>

      {fp.pads.map((pad) => (
        <g key={pad.name}>
          {pad.shape === 'rect' ? (
            <rect
              x={pad.position.x - pad.size.width / 2}
              y={pad.position.y - pad.size.height / 2}
              width={pad.size.width}
              height={pad.size.height}
              fill={COPPER_COLOR}
              rx={0.1}
            />
          ) : (
            <ellipse
              cx={pad.position.x}
              cy={pad.position.y}
              rx={pad.size.width / 2}
              ry={pad.size.height / 2}
              fill={COPPER_COLOR}
            />
          )}
          {pad.holeDiameter > 0 && (
            <circle
              cx={pad.position.x}
              cy={pad.position.y}
              r={pad.holeDiameter / 2}
              fill={BOARD_COLOR}
            />
          )}
        </g>
      ))}
    </g>
  )
}

export function PCBCanvas() {
  const svgRef = useRef<SVGSVGElement>(null)
  const board = usePCBStore((s) => s.board)
  const zoom = usePCBStore((s) => s.zoom)
  const pan = usePCBStore((s) => s.pan)
  const selectedComponentId = usePCBStore((s) => s.selectedComponentId)
  const setZoom = usePCBStore((s) => s.setZoom)
  const setPan = usePCBStore((s) => s.setPan)
  const selectComponent = usePCBStore((s) => s.selectComponent)
  const selectTrack = usePCBStore((s) => s.selectTrack)
  const activeLayer = usePCBStore((s) => s.activeLayer)

  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  if (!board) return null

  const padding = 10
  const viewW = board.width + padding * 2
  const viewH = board.height + padding * 2

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(zoom * factor)
    },
    [zoom, setZoom],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || e.button === 2) {
        isDragging.current = true
        dragStart.current = { x: e.clientX, y: e.clientY }
        panStart.current = { x: pan.x, y: pan.y }
      }
    },
    [pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.current) {
        const dx = (e.clientX - dragStart.current.x) / zoom
        const dy = (e.clientY - dragStart.current.y) / zoom
        setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
      }
    },
    [zoom, setPan],
  )

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleSvgClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.current) return
      const target = e.target as SVGElement
      const compEl = target.closest('[data-component-id]') as SVGElement | null
      if (compEl) {
        selectComponent(compEl.dataset.componentId ?? null)
      } else {
        selectComponent(null)
        selectTrack(null)
      }
    },
    [selectComponent, selectTrack],
  )

  return (
    <div className="w-full h-full overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewW} ${viewH}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            selectComponent(null)
            selectTrack(null)
          }
        }}
        role="img"
        aria-label="PCB layout canvas"
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <title>PCB Layout Editor</title>
        <g transform={`translate(${padding + pan.x}, ${padding + pan.y}) scale(${zoom})`}>
          <rect
            x={-padding}
            y={-padding}
            width={board.width + padding * 2}
            height={board.height + padding * 2}
            fill={BOARD_COLOR}
            rx={1}
          />

          <defs>
            <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
              <path
                d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
                fill="none"
                stroke={GRID_COLOR}
                strokeWidth={0.05}
                opacity={0.3}
              />
            </pattern>
          </defs>
          <rect x={0} y={0} width={board.width} height={board.height} fill="url(#grid)" />

          <polygon
            points={board.boardOutline.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#2e7d32"
            strokeWidth={0.2}
          />

          {board.tracks
            .filter((t) => t.layer === activeLayer)
            .map((track) => (
              <polyline
                key={track.id}
                points={track.points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={TRACE_COLOR}
                strokeWidth={track.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                data-track-id={track.id}
                style={{ cursor: 'pointer' }}
              />
            ))}

          {board.vias.map((via) => (
            <g key={via.id}>
              <circle
                cx={via.position.x}
                cy={via.position.y}
                r={via.outerDiameter / 2}
                fill={VIA_COLOR}
              />
              <circle
                cx={via.position.x}
                cy={via.position.y}
                r={via.drillDiameter / 2}
                fill={BOARD_COLOR}
              />
            </g>
          ))}

          {board.placedComponents
            .filter((c) => c.side === 'top')
            .map((comp) => (
              <g
                key={comp.componentId}
                data-component-id={comp.componentId}
                style={{ cursor: 'pointer' }}
              >
                <FootprintLayer
                  component={comp}
                  selected={comp.componentId === selectedComponentId}
                />
              </g>
            ))}
        </g>
      </svg>

      <div className="absolute bottom-2 right-2 flex gap-1 text-[10px] font-mono text-copper">
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}
