import type { Component } from '@/features/components/base/types.ts'
import { create } from 'zustand'
import { Circuit } from './model/Circuit.ts'
import type { CircuitNode } from './model/types.ts'

interface CircuitState {
  circuit: Circuit | null
  components: Map<string, Component>
  selectedComponentId: string | null
  selectedNodeId: string | null

  createCircuit: (id: string, name: string) => void
  addNode: (label?: string, type?: CircuitNode['type']) => CircuitNode | undefined
  removeNode: (nodeId: string) => void
  addComponent: (component: Component) => void
  removeComponent: (componentId: string) => void
  selectComponent: (componentId: string | null) => void
  selectNode: (nodeId: string | null) => void
  connect: (componentId: string, pinIndex: number, nodeId: string) => void
  disconnect: (connectionId: string) => void
  clear: () => void
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  circuit: null,
  components: new Map(),
  selectedComponentId: null,
  selectedNodeId: null,

  createCircuit: (id: string, name: string) => {
    const circuit = new Circuit(id, name)
    set({ circuit, components: new Map(), selectedComponentId: null, selectedNodeId: null })
  },

  addNode: (label?: string, type: CircuitNode['type'] = 'signal') => {
    const { circuit } = get()
    if (!circuit) return undefined
    const node = circuit.addNode(label, type)
    set({ circuit })
    return node
  },

  removeNode: (nodeId: string) => {
    const { circuit } = get()
    if (!circuit) return
    circuit.removeNode(nodeId)
    set({ circuit })
  },

  addComponent: (component: Component) => {
    const { components } = get()
    const next = new Map(components)
    next.set(component.id, component)
    set({ components: next })
  },

  removeComponent: (componentId: string) => {
    const { components, circuit } = get()
    const next = new Map(components)
    next.delete(componentId)
    if (circuit) {
      const conns = circuit.getConnectionsForComponent(componentId)
      for (const conn of conns) {
        circuit.removeConnection(conn.id)
      }
    }
    const sel = get().selectedComponentId === componentId ? null : get().selectedComponentId
    set({ components: next, selectedComponentId: sel, circuit })
  },

  selectComponent: (componentId: string | null) => {
    set({ selectedComponentId: componentId, selectedNodeId: null })
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId, selectedComponentId: null })
  },

  connect: (componentId: string, pinIndex: number, nodeId: string) => {
    const { circuit } = get()
    if (!circuit) return
    circuit.addConnection(componentId, pinIndex, nodeId)
    set({ circuit })
  },

  disconnect: (connectionId: string) => {
    const { circuit } = get()
    if (!circuit) return
    circuit.removeConnection(connectionId)
    set({ circuit })
  },

  clear: () => {
    set({ circuit: null, components: new Map(), selectedComponentId: null, selectedNodeId: null })
  },
}))
