import { useCallback, useRef, useState } from 'react'
import { getFootprint } from '../model/Footprint.ts'
import type { Airwire, Point } from '../model/types.ts'
import { usePCBStore } from '../store.ts'

const GRID_SIZE = 2.54
const BOARD_COLOR = '#1b5e20'
const COPPER_COLOR = '#b87333'
const SILK_COLOR = '#ffffff'
const TRACE_COLOR = '#b87333'
const TRACE_BOTTOM_COLOR = '#8b4513'
const ROUTING_COLOR = '#ffd700'
const VIA_COLOR = '#8b6914'
const GRID_COLOR = '#e0e0e0'
const SELECT_COLOR = '#4f8ff7'
const ROUTING_HANDLE_RADIUS = 0.4

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

export function PCBCanvas({ airwires }: { airwires?: Airwire[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const board = usePCBStore((s) => s.board)
  const zoom = usePCBStore((s) => s.zoom)
  const pan = usePCBStore((s) => s.pan)
  const selectedComponentId = usePCBStore((s) => s.selectedComponentId)
  const isRouting = usePCBStore((s) => s.isRouting)
  const routingPoints = usePCBStore((s) => s.routingPoints)
  const setZoom = usePCBStore((s) => s.setZoom)
  const setPan = usePCBStore((s) => s.setPan)
  const selectComponent = usePCBStore((s) => s.selectComponent)
  const selectTrack = usePCBStore((s) => s.selectTrack)
  const activeLayer = usePCBStore((s) => s.activeLayer)
  const startRouting = usePCBStore((s) => s.startRouting)
  const addRoutingPoint = usePCBStore((s) => s.addRoutingPoint)
  const finishRouting = usePCBStore((s) => s.finishRouting)
  const cancelRouting = usePCBStore((s) => s.cancelRouting)
  const placeViaInRoute = usePCBStore((s) => s.placeViaInRoute)
  const drcViolations = usePCBStore((s) => s.drcViolations)

  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState<Point | null>(null)

  if (!board) return null

  const padding = 10
  const viewW = board.width + padding * 2
  const viewH = board.height + padding * 2

  function screenToBoard(clientX: number, clientY: number): Point {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * viewW
    const svgY = ((clientY - rect.top) / rect.height) * viewH
    return snapToGrid({
      x: (svgX - padding - pan.x) / zoom,
      y: (svgY - padding - pan.y) / zoom,
    })
  }

  function snapToGrid(p: Point): Point {
    return {
      x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(p.y / GRID_SIZE) * GRID_SIZE,
    }
  }

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
      if (e.button === 1 || (e.button === 2 && !isRouting)) {
        isDragging.current = true
        dragStart.current = { x: e.clientX, y: e.clientY }
        panStart.current = { x: pan.x, y: pan.y }
      }
    },
    [pan, isRouting],
  )

  function handleMouseMove(e: React.MouseEvent) {
    if (isDragging.current) {
      const dx = (e.clientX - dragStart.current.x) / zoom
      const dy = (e.clientY - dragStart.current.y) / zoom
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
    }
    const pos = screenToBoard(e.clientX, e.clientY)
    setMousePos(pos)
  }

  function handleMouseUp() {
    isDragging.current = false
  }

  function handleSvgClick(e: React.MouseEvent) {
    if (isDragging.current) return
    if (e.button === 2) {
      if (isRouting) cancelRouting()
      return
    }

    const pos = screenToBoard(e.clientX, e.clientY)

    if (!isRouting) {
      const target = e.target as SVGElement
      const compEl = target.closest('[data-component-id]') as SVGElement | null
      if (compEl) {
        selectComponent(compEl.dataset.componentId ?? null)
        return
      }
      selectComponent(null)
      selectTrack(null)
      startRouting(pos)
    } else {
      addRoutingPoint(pos)
    }
  }

  function handleSvgDblClick() {
    if (isRouting) {
      finishRouting()
    }
  }

  function routingPreviewPoints(): Point[] {
    if (!isRouting || routingPoints.length === 0 || !mousePos) return []
    const last = routingPoints[routingPoints.length - 1]
    return [
      { x: last.x, y: last.y },
      { x: mousePos.x, y: last.y },
      { x: mousePos.x, y: mousePos.y },
    ]
  }

  return (
    <div
      className="w-full h-full overflow-hidden relative"
      onContextMenu={(e) => e.preventDefault()}
    >
      {isRouting && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-[10px] font-mono z-10 shadow">
          Routing [{activeLayer.toUpperCase()}] — Click: place point · V: via + switch layer · Esc:
          cancel · Dbl-click: finish
        </div>
      )}

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
        onDoubleClick={handleSvgDblClick}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (isRouting) cancelRouting()
            else {
              selectComponent(null)
              selectTrack(null)
            }
          }
          if (e.key === 'Enter' && isRouting) finishRouting()
          if ((e.key === 'v' || e.key === 'V') && isRouting) placeViaInRoute()
        }}
        role="img"
        aria-label="PCB layout canvas"
        style={{ cursor: isDragging.current ? 'grabbing' : isRouting ? 'crosshair' : 'default' }}
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

          {airwires?.map((aw, i) => (
            <line
              key={`${aw.netId}-${i}`}
              x1={aw.start.x}
              y1={aw.start.y}
              x2={aw.end.x}
              y2={aw.end.y}
              stroke="#4f8ff7"
              strokeWidth={0.08}
              strokeDasharray="0.3 0.3"
              opacity={0.5}
            />
          ))}

          {board.tracks.map((track) => {
            const isBottom = track.layer === 'bottom'
            return (
              <polyline
                key={track.id}
                points={track.points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={isBottom ? TRACE_BOTTOM_COLOR : TRACE_COLOR}
                strokeWidth={track.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={isBottom ? '0.3 0.2' : 'none'}
                opacity={track.layer === activeLayer ? 1 : 0.5}
                data-track-id={track.id}
                style={{ cursor: 'pointer' }}
              />
            )
          })}

          {isRouting && routingPoints.length > 0 && (
            <polyline
              points={routingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={ROUTING_COLOR}
              strokeWidth={0.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.5 0.3"
              opacity={0.8}
            />
          )}

          {isRouting &&
            routingPoints.length > 0 &&
            mousePos &&
            (() => {
              const preview = routingPreviewPoints()
              return (
                <>
                  <polyline
                    points={preview.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={ROUTING_COLOR}
                    strokeWidth={0.3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="0.3 0.3"
                    opacity={0.5}
                  />
                  <circle
                    cx={mousePos.x}
                    cy={mousePos.y}
                    r={ROUTING_HANDLE_RADIUS}
                    fill={ROUTING_COLOR}
                    opacity={0.7}
                  />
                </>
              )
            })()}

          {isRouting &&
            routingPoints.map((p, i) => (
              <circle
                key={`${p.x.toFixed(3)}-${p.y.toFixed(3)}-${i}`}
                cx={p.x}
                cy={p.y}
                r={ROUTING_HANDLE_RADIUS}
                fill={i === 0 ? '#00ff00' : ROUTING_COLOR}
                stroke="#fff"
                strokeWidth={0.1}
              />
            ))}

          {drcViolations.map((v) => (
            <g key={`${v.type}-${v.position.x.toFixed(2)}-${v.position.y.toFixed(2)}`}>
              <circle
                cx={v.position.x}
                cy={v.position.y}
                r={1}
                fill="none"
                stroke={v.severity === 'error' ? '#ff0000' : '#ff8800'}
                strokeWidth={0.15}
                strokeDasharray="0.2 0.2"
                opacity={0.8}
              />
              <circle
                cx={v.position.x}
                cy={v.position.y}
                r={1}
                fill={v.severity === 'error' ? '#ff0000' : '#ff8800'}
                opacity={0.2}
              />
            </g>
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

      <div className="absolute bottom-2 right-2 flex gap-2 text-[10px] font-mono text-copper">
        <span>{Math.round(zoom * 100)}%</span>
        {mousePos && (
          <span className="text-text-secondary">
            {mousePos.x.toFixed(2)} {mousePos.y.toFixed(2)} mm
          </span>
        )}
      </div>
    </div>
  )
}
