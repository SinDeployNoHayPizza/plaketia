import { create } from 'zustand'
import { PCBBoard } from './model/PCBBoard.ts'
import type { DRCViolation, PlacedComponent, Point, Track, Via } from './model/types.ts'

export interface PCBState {
  board: PCBBoard | null
  selectedComponentId: string | null
  selectedTrackId: string | null
  activeLayer: 'top' | 'bottom'
  drcViolations: DRCViolation[]
  zoom: number
  pan: { x: number; y: number }

  routingPoints: Point[]
  routingNetId: string
  routingWidth: number
  isRouting: boolean

  createBoard: (width?: number, height?: number) => void
  setBoard: (board: PCBBoard) => void
  placeComponent: (component: PlacedComponent) => void
  removeComponent: (componentId: string) => void
  addTrack: (points: Point[], layer: 'top' | 'bottom', width: number, netId: string) => void
  removeTrack: (trackId: string) => void
  addVia: (position: Point, drillDiameter: number, outerDiameter: number, netId: string) => void
  removeVia: (viaId: string) => void
  selectComponent: (id: string | null) => void
  selectTrack: (id: string | null) => void
  setActiveLayer: (layer: 'top' | 'bottom') => void
  runDRC: () => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  startRouting: (point: Point, netId?: string) => void
  addRoutingPoint: (point: Point) => void
  finishRouting: () => void
  cancelRouting: () => void
  placeViaInRoute: () => void
  reset: () => void
}

export const usePCBStore = create<PCBState>((set, get) => ({
  board: null,
  selectedComponentId: null,
  selectedTrackId: null,
  activeLayer: 'top',
  drcViolations: [],
  zoom: 1,
  pan: { x: 0, y: 0 },

  routingPoints: [],
  routingNetId: 'N001',
  routingWidth: 0.5,
  isRouting: false,

  createBoard: (width = 100, height = 80) => {
    const board = new PCBBoard({ width, height })
    set({ board })
  },

  setBoard: (board) => set({ board }),

  placeComponent: (component) => {
    const { board } = get()
    if (!board) return
    board.placeComponent(component)
    set({ board: new PCBBoard(board.toJSON()) })
  },

  removeComponent: (componentId) => {
    const { board } = get()
    if (!board) return
    board.removeComponent(componentId)
    set({ board: new PCBBoard(board.toJSON()) })
  },

  addTrack: (points, layer, width, netId) => {
    const { board } = get()
    if (!board) return
    board.addTrack(points, layer, width, netId)
    set({ board: new PCBBoard(board.toJSON()) })
  },

  removeTrack: (trackId) => {
    const { board } = get()
    if (!board) return
    board.removeTrack(trackId)
    set({ board: new PCBBoard(board.toJSON()) })
  },

  addVia: (position, drillDiameter, outerDiameter, netId) => {
    const { board } = get()
    if (!board) return
    board.addVia(position, drillDiameter, outerDiameter, netId)
    set({ board: new PCBBoard(board.toJSON()) })
  },

  removeVia: (viaId) => {
    const { board } = get()
    if (!board) return
    board.removeVia(viaId)
    set({ board: new PCBBoard(board.toJSON()) })
  },

  selectComponent: (id) => set({ selectedComponentId: id, selectedTrackId: null }),
  selectTrack: (id) => set({ selectedTrackId: id, selectedComponentId: null }),

  setActiveLayer: (layer) => set({ activeLayer: layer }),

  runDRC: () => {
    const { board } = get()
    if (!board) return
    const violations = board.runDRC()
    set({ drcViolations: violations })
  },

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),
  setPan: (pan) => set({ pan }),

  startRouting: (point, netId = 'N001') => {
    set({ routingPoints: [{ ...point }], routingNetId: netId, isRouting: true })
  },

  addRoutingPoint: (point) => {
    const { routingPoints, isRouting } = get()
    if (!isRouting) return
    set({ routingPoints: [...routingPoints, { ...point }] })
  },

  finishRouting: () => {
    const { routingPoints, activeLayer, routingWidth, routingNetId, board } = get()
    if (!board || routingPoints.length < 2) {
      set({ routingPoints: [], isRouting: false })
      return
    }
    board.addTrack(routingPoints, activeLayer, routingWidth, routingNetId)
    set({ board: new PCBBoard(board.toJSON()), routingPoints: [], isRouting: false })
  },

  cancelRouting: () => {
    set({ routingPoints: [], isRouting: false })
  },

  placeViaInRoute: () => {
    const { routingPoints, activeLayer, routingWidth, routingNetId, board } = get()
    if (!board || routingPoints.length === 0) return

    const lastPos = routingPoints[routingPoints.length - 1]

    board.addTrack(routingPoints, activeLayer, routingWidth, routingNetId)
    board.addVia(lastPos, 0.3, 0.6, routingNetId)

    const newLayer = activeLayer === 'top' ? 'bottom' : 'top'

    set({
      board: new PCBBoard(board.toJSON()),
      routingPoints: [{ ...lastPos }],
      activeLayer: newLayer,
      isRouting: true,
    })
  },

  reset: () =>
    set({
      board: null,
      selectedComponentId: null,
      selectedTrackId: null,
      activeLayer: 'top',
      drcViolations: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
    }),
}))
