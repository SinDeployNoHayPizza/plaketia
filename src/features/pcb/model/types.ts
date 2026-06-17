export interface Point {
  x: number
  y: number
}

export interface PCBMetadata {
  name: string
  created: string
  modified: string
  designRules: DesignRules
}

export interface DesignRules {
  minTraceWidth: number
  minClearance: number
  minAnnularRing: number
  minDrillDiameter: number
}

export type LayerType =
  | 'top'
  | 'bottom'
  | 'solderMaskTop'
  | 'solderMaskBottom'
  | 'silkscreenTop'
  | 'silkscreenBottom'
  | 'substrate'

export interface PCBLayer {
  name: string
  type: LayerType
  visible: boolean
}

export interface FootprintPad {
  name: string
  position: Point
  size: { width: number; height: number }
  shape: 'round' | 'rect' | 'oval'
  holeDiameter: number
  layer: 'top' | 'bottom'
  netId: string
}

export interface Footprint {
  name: string
  description: string
  pads: FootprintPad[]
  outline: Point[]
  height: number
}

export interface PlacedComponent {
  componentId: string
  reference: string
  type: string
  footprintName: string
  position: Point
  rotation: number
  side: 'top' | 'bottom'
  locked: boolean
}

export interface Track {
  id: string
  layer: 'top' | 'bottom'
  points: Point[]
  width: number
  netId: string
}

export interface Via {
  id: string
  position: Point
  drillDiameter: number
  outerDiameter: number
  netId: string
}

export interface DRCViolation {
  type: 'clearance' | 'min-width' | 'annular-ring' | 'drill-size' | 'board-edge'
  message: string
  position: Point
  severity: 'error' | 'warning'
}

export interface Airwire {
  start: Point
  end: Point
  netId: string
}

export interface PCBSnapshot {
  board: PCBBoardData
}

export interface PCBBoardData {
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
}
