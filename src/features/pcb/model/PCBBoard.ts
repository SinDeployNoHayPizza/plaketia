import type {
  DRCViolation,
  DesignRules,
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

    for (const track of this.tracks) {
      if (track.width < this.designRules.minTraceWidth) {
        violations.push({
          type: 'min-width',
          message: `Track ${track.id} width (${track.width}mm) below minimum (${this.designRules.minTraceWidth}mm)`,
          position: track.points[0],
          severity: 'error',
        })
      }
    }

    for (const via of this.vias) {
      if (via.drillDiameter < this.designRules.minDrillDiameter) {
        violations.push({
          type: 'drill-size',
          message: `Via ${via.id} drill (${via.drillDiameter}mm) below minimum (${this.designRules.minDrillDiameter}mm)`,
          position: via.position,
          severity: 'error',
        })
      }
      const ring = (via.outerDiameter - via.drillDiameter) / 2
      if (ring < this.designRules.minAnnularRing) {
        violations.push({
          type: 'annular-ring',
          message: `Via ${via.id} annular ring (${ring.toFixed(3)}mm) below minimum (${this.designRules.minAnnularRing}mm)`,
          position: via.position,
          severity: 'error',
        })
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
