import { create } from 'zustand'
import { PCBBoard } from './model/PCBBoard.ts'
import type { DRCViolation, PlacedComponent, Track, Via } from './model/types.ts'

export interface PCBState {
  board: PCBBoard | null
  selectedComponentId: string | null
  selectedTrackId: string | null
  activeLayer: 'top' | 'bottom'
  drcViolations: DRCViolation[]
  zoom: number
  pan: { x: number; y: number }

  createBoard: (width?: number, height?: number) => void
  setBoard: (board: PCBBoard) => void
  placeComponent: (component: PlacedComponent) => void
  removeComponent: (componentId: string) => void
  addTrack: (
    points: { x: number; y: number }[],
    layer: 'top' | 'bottom',
    width: number,
    netId: string,
  ) => void
  removeTrack: (trackId: string) => void
  addVia: (
    position: { x: number; y: number },
    drillDiameter: number,
    outerDiameter: number,
    netId: string,
  ) => void
  removeVia: (viaId: string) => void
  selectComponent: (id: string | null) => void
  selectTrack: (id: string | null) => void
  setActiveLayer: (layer: 'top' | 'bottom') => void
  runDRC: () => void
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
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
