import { getFootprint } from './Footprint.ts'
import type {
  DRCViolation,
  DesignRules,
  FootprintPad,
  PCBBoardData,
  PCBLayer,
  PCBMetadata,
  PlacedComponent,
  Point,
  Track,
  Via,
} from './types.ts'

let nextTrackId = 1
let nextViaId = 1

function generateTrackId(): string {
  return `T${String(nextTrackId++).padStart(3, '0')}`
}

function generateViaId(): string {
  return `V${String(nextViaId++).padStart(3, '0')}`
}

const defaultLayers: PCBLayer[] = [
  { name: 'Top Copper', type: 'top', visible: true },
  { name: 'Bottom Copper', type: 'bottom', visible: false },
  { name: 'Solder Mask Top', type: 'solderMaskTop', visible: true },
  { name: 'Solder Mask Bottom', type: 'solderMaskBottom', visible: false },
  { name: 'Silkscreen Top', type: 'silkscreenTop', visible: true },
  { name: 'Silkscreen Bottom', type: 'silkscreenBottom', visible: false },
]

const defaultDesignRules: DesignRules = {
  minTraceWidth: 0.254,
  minClearance: 0.254,
  minAnnularRing: 0.15,
  minDrillDiameter: 0.3,
}

function sqDist(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

function pointToSegmentDist(p: Point, a: Point, b: Point): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const len2 = abx * abx + aby * aby
  if (len2 === 0) return Math.sqrt(sqDist(p, a))
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.sqrt(sqDist(p, { x: a.x + t * abx, y: a.y + t * aby }))
}

function segmentToSegmentDist(a: Point, b: Point, c: Point, d: Point): number {
  return Math.min(
    pointToSegmentDist(a, c, d),
    pointToSegmentDist(b, c, d),
    pointToSegmentDist(c, a, b),
    pointToSegmentDist(d, a, b),
  )
}

function trackPadDist(
  trackPoints: Point[],
  padPos: Point,
  padSize: { width: number; height: number },
  padShape: 'round' | 'rect' | 'oval',
): number {
  let minDist = Number.POSITIVE_INFINITY
  for (let i = 0; i < trackPoints.length - 1; i++) {
    const a = trackPoints[i]
    const b = trackPoints[i + 1]
    const d =
      padShape === 'round'
        ? pointToSegmentDist(padPos, a, b) - Math.max(padSize.width, padSize.height) / 2
        : rectSegmentDist(padPos, padSize, a, b)
    if (d < minDist) minDist = d
  }
  return minDist
}

function rectSegmentDist(
  center: Point,
  size: { width: number; height: number },
  a: Point,
  b: Point,
): number {
  const halfW = size.width / 2
  const halfH = size.height / 2
  const corners: Point[] = [
    { x: center.x - halfW, y: center.y - halfH },
    { x: center.x + halfW, y: center.y - halfH },
    { x: center.x - halfW, y: center.y + halfH },
    { x: center.x + halfW, y: center.y + halfH },
  ]
  const edges = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
  ]
  let minDist = Number.POSITIVE_INFINITY
  for (const [i, j] of edges) {
    const d = segmentToSegmentDist(corners[i], corners[j], a, b)
    if (d < minDist) minDist = d
  }
  for (const c of corners) {
    const d = pointToSegmentDist(c, a, b)
    if (d < minDist) minDist = d
  }
  return minDist
}

function pointToPadDist(
  p: Point,
  padPos: Point,
  padSize: { width: number; height: number },
  padShape: 'round' | 'rect' | 'oval',
): number {
  if (padShape === 'round') {
    const r = Math.max(padSize.width, padSize.height) / 2
    return Math.max(0, Math.sqrt(sqDist(p, padPos)) - r)
  }
  const halfW = padSize.width / 2
  const halfH = padSize.height / 2
  const dx = Math.max(0, Math.abs(p.x - padPos.x) - halfW)
  const dy = Math.max(0, Math.abs(p.y - padPos.y) - halfH)
  return Math.sqrt(dx * dx + dy * dy)
}

function getPadWorldPos(comp: PlacedComponent, pad: FootprintPad): Point {
  const rad = (comp.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    x: comp.position.x + pad.position.x * cos - pad.position.y * sin,
    y: comp.position.y + pad.position.x * sin + pad.position.y * cos,
  }
}

export class PCBBoard {
  width: number
  height: number
  thickness: number
  material: 'FR4' | 'CEM1'
  copperWeight: number
  layers: PCBLayer[]
  placedComponents: PlacedComponent[]
  tracks: Track[]
  vias: Via[]
  boardOutline: Point[]
  metadata: PCBMetadata

  constructor(data?: Partial<PCBBoardData>) {
    const now = new Date().toISOString()
    this.width = data?.width ?? 100
    this.height = data?.height ?? 80
    this.thickness = data?.thickness ?? 1.6
    this.material = data?.material ?? 'FR4'
    this.copperWeight = data?.copperWeight ?? 1
    this.layers = data?.layers ?? defaultLayers.map((l) => ({ ...l }))
    this.placedComponents = data?.placedComponents ?? []
    this.tracks = data?.tracks ?? []
    this.vias = data?.vias ?? []
    this.boardOutline = data?.boardOutline ?? this.defaultOutline()
    this.metadata = data?.metadata ?? {
      name: 'Untitled PCB',
      created: now,
      modified: now,
      designRules: { ...defaultDesignRules },
    }
  }

  private defaultOutline(): Point[] {
    return [
      { x: 0, y: 0 },
      { x: this.width, y: 0 },
      { x: this.width, y: this.height },
      { x: 0, y: this.height },
    ]
  }

  get designRules(): DesignRules {
    return this.metadata.designRules
  }

  set designRules(rules: Partial<DesignRules>) {
    this.metadata.designRules = { ...this.metadata.designRules, ...rules }
    this.touch()
  }

  addTrack(points: Point[], layer: 'top' | 'bottom', width: number, netId: string): Track {
    const track: Track = {
      id: generateTrackId(),
      layer,
      points: points.map((p) => ({ ...p })),
      width,
      netId,
    }
    this.tracks.push(track)
    this.touch()
    return track
  }

  removeTrack(trackId: string): void {
    this.tracks = this.tracks.filter((t) => t.id !== trackId)
    this.touch()
  }

  addVia(position: Point, drillDiameter: number, outerDiameter: number, netId: string): Via {
    const via: Via = {
      id: generateViaId(),
      position: { ...position },
      drillDiameter,
      outerDiameter,
      netId,
    }
    this.vias.push(via)
    this.touch()
    return via
  }

  removeVia(viaId: string): void {
    this.vias = this.vias.filter((v) => v.id !== viaId)
    this.touch()
  }

  placeComponent(component: PlacedComponent): void {
    const idx = this.placedComponents.findIndex((c) => c.componentId === component.componentId)
    if (idx >= 0) {
      this.placedComponents[idx] = { ...component }
    } else {
      this.placedComponents.push(component)
    }
    this.touch()
  }

  removeComponent(componentId: string): void {
    this.placedComponents = this.placedComponents.filter((c) => c.componentId !== componentId)
    this.touch()
  }

  getTracksForNet(netId: string): Track[] {
    return this.tracks.filter((t) => t.netId === netId)
  }

  getComponentsOnNet(netId: string): PlacedComponent[] {
    return this.placedComponents.filter((c) => c.componentId === netId)
  }

  runDRC(): DRCViolation[] {
    const violations: DRCViolation[] = []
    const dr = this.designRules
    const edgeMargin = dr.minClearance

    for (const track of this.tracks) {
      if (track.width < dr.minTraceWidth) {
        violations.push({
          type: 'min-width',
          message: `Track ${track.id} width (${track.width}mm) below minimum (${dr.minTraceWidth}mm)`,
          position: track.points[0],
          severity: 'error',
        })
      }

      for (const p of track.points) {
        if (
          p.x < edgeMargin ||
          p.y < edgeMargin ||
          p.x > this.width - edgeMargin ||
          p.y > this.height - edgeMargin
        ) {
          violations.push({
            type: 'board-edge',
            message: `Track ${track.id} too close to board edge`,
            position: p,
            severity: 'warning',
          })
          break
        }
      }
    }

    for (let i = 0; i < this.tracks.length; i++) {
      for (let j = i + 1; j < this.tracks.length; j++) {
        const ta = this.tracks[i]
        const tb = this.tracks[j]
        if (ta.layer !== tb.layer) continue
        let tooClose = false
        for (let pi = 0; pi < ta.points.length - 1 && !tooClose; pi++) {
          for (let pj = 0; pj < tb.points.length - 1 && !tooClose; pj++) {
            const d = segmentToSegmentDist(
              ta.points[pi],
              ta.points[pi + 1],
              tb.points[pj],
              tb.points[pj + 1],
            )
            if (d < dr.minClearance) {
              violations.push({
                type: 'clearance',
                message: `Clearance violation between ${ta.id} and ${tb.id} (${d.toFixed(3)}mm < ${dr.minClearance}mm)`,
                position: ta.points[pi],
                severity: 'error',
              })
              tooClose = true
            }
          }
        }
      }
    }

    for (const via of this.vias) {
      if (via.drillDiameter < dr.minDrillDiameter) {
        violations.push({
          type: 'drill-size',
          message: `Via ${via.id} drill (${via.drillDiameter}mm) below minimum (${dr.minDrillDiameter}mm)`,
          position: via.position,
          severity: 'error',
        })
      }
      const ring = (via.outerDiameter - via.drillDiameter) / 2
      if (ring < dr.minAnnularRing) {
        violations.push({
          type: 'annular-ring',
          message: `Via ${via.id} annular ring (${ring.toFixed(3)}mm) below minimum (${dr.minAnnularRing}mm)`,
          position: via.position,
          severity: 'error',
        })
      }
      if (
        via.position.x < edgeMargin ||
        via.position.y < edgeMargin ||
        via.position.x > this.width - edgeMargin ||
        via.position.y > this.height - edgeMargin
      ) {
        violations.push({
          type: 'board-edge',
          message: `Via ${via.id} too close to board edge`,
          position: via.position,
          severity: 'warning',
        })
      }

      for (const track of this.tracks) {
        const d = pointToSegmentDist(
          via.position,
          track.points[0],
          track.points[track.points.length - 1],
        )
        if (d < dr.minClearance) {
          violations.push({
            type: 'clearance',
            message: `Clearance violation between ${via.id} and ${track.id} (${d.toFixed(3)}mm < ${dr.minClearance}mm)`,
            position: via.position,
            severity: 'error',
          })
        }
      }
    }

    for (const comp of this.placedComponents) {
      if (
        comp.position.x < edgeMargin ||
        comp.position.y < edgeMargin ||
        comp.position.x > this.width - edgeMargin ||
        comp.position.y > this.height - edgeMargin
      ) {
        violations.push({
          type: 'board-edge',
          message: `Component ${comp.reference} too close to board edge`,
          position: comp.position,
          severity: 'warning',
        })
      }

      const fp = getFootprint(comp.footprintName)
      if (!fp) continue

      for (const pad of fp.pads) {
        const padPos = getPadWorldPos(comp, pad)

        for (const track of this.tracks) {
          const d = trackPadDist(track.points, padPos, pad.size, pad.shape)
          if (d < dr.minClearance) {
            violations.push({
              type: 'clearance',
              message: `Clearance violation between ${comp.reference}.${pad.name} and ${track.id} (${d.toFixed(3)}mm < ${dr.minClearance}mm)`,
              position: padPos,
              severity: 'error',
            })
          }
        }

        for (const via of this.vias) {
          const d = pointToPadDist(via.position, padPos, pad.size, pad.shape)
          if (d < dr.minClearance) {
            violations.push({
              type: 'clearance',
              message: `Clearance violation between ${comp.reference}.${pad.name} and ${via.id} (${d.toFixed(3)}mm < ${dr.minClearance}mm)`,
              position: via.position,
              severity: 'error',
            })
          }
        }

        for (const other of this.placedComponents) {
          if (other.componentId === comp.componentId) continue
          const ofp = getFootprint(other.footprintName)
          if (!ofp) continue
          for (const opad of ofp.pads) {
            const opadPos = getPadWorldPos(other, opad)
            const d = pointToPadDist(padPos, opadPos, opad.size, opad.shape)
            if (d < dr.minClearance) {
              violations.push({
                type: 'clearance',
                message: `Clearance violation between ${comp.reference}.${pad.name} and ${other.reference}.${opad.name} (${d.toFixed(3)}mm < ${dr.minClearance}mm)`,
                position: padPos,
                severity: 'error',
              })
            }
          }
        }
      }
    }

    return violations
  }

  toJSON(): PCBBoardData {
    return {
      width: this.width,
      height: this.height,
      thickness: this.thickness,
      material: this.material,
      copperWeight: this.copperWeight,
      layers: this.layers.map((l) => ({ ...l })),
      placedComponents: this.placedComponents.map((c) => ({ ...c })),
      tracks: this.tracks.map((t) => ({ ...t, points: t.points.map((p) => ({ ...p })) })),
      vias: this.vias.map((v) => ({ ...v, position: { ...v.position } })),
      boardOutline: this.boardOutline.map((p) => ({ ...p })),
      metadata: { ...this.metadata, designRules: { ...this.metadata.designRules } },
    }
  }

  static fromJSON(data: PCBBoardData): PCBBoard {
    return new PCBBoard(data)
  }

  private touch(): void {
    this.metadata.modified = new Date().toISOString()
  }
}
