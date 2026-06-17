import { Circuit } from '@/features/circuit/model/Circuit.ts'
import type {
  Connection as CircuitConnection,
  CircuitMetadata,
  CircuitNode,
} from '@/features/circuit/model/types.ts'
import { useCircuitStore } from '@/features/circuit/store.ts'
import type { Component } from '@/features/components/base/types.ts'
import { VddSource } from '@/features/components/sources/VddSource.ts'
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type XYPosition,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react'
import { create } from 'zustand'
import type { ComponentNodeData } from './nodes/ComponentNode.tsx'
import { componentRegistry } from './registry.tsx'

let schematicNodeIdCounter = 0

function nextSchematicId(): string {
  schematicNodeIdCounter++
  return `sc-${schematicNodeIdCounter}`
}

interface UndoEntry {
  nodes: Node[]
  edges: Edge[]
  circuitData: {
    id: string
    nodes: [string, CircuitNode][]
    connections: CircuitConnection[]
    metadata: CircuitMetadata
  } | null
  componentsData: {
    id: string
    reference: string
    value: string
    type: string
    model: string | undefined
    position: { x: number; y: number }
    rotation: number
    metadata: Record<string, unknown>
  }[]
  schematicNodeIdCounter: number
}

function createUndoEntry(nodes: Node[], edges: Edge[]): UndoEntry {
  const cs = useCircuitStore.getState()
  return {
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    circuitData: cs.circuit
      ? {
          id: cs.circuit.id,
          nodes: Array.from(cs.circuit.nodes.entries()),
          connections: [...cs.circuit.connections],
          metadata: { ...cs.circuit.metadata },
        }
      : null,
    componentsData: Array.from(cs.components.entries()).map(([, comp]) => ({
      id: comp.id,
      reference: comp.reference,
      value: comp.value,
      type: comp.type,
      model: (comp as { model: string | undefined }).model,
      position: { ...comp.position },
      rotation: comp.rotation,
      metadata: { ...comp.metadata },
    })),
    schematicNodeIdCounter,
  }
}

function applyUndoEntry(entry: UndoEntry): void {
  const cs = useCircuitStore.getState()
  schematicNodeIdCounter = Math.max(schematicNodeIdCounter, entry.schematicNodeIdCounter)

  if (entry.circuitData) {
    const nodesMap = new Map(entry.circuitData.nodes)
    const circuit = Circuit.fromJSON({
      id: entry.circuitData.id,
      nodes: nodesMap,
      connections: entry.circuitData.connections,
      metadata: entry.circuitData.metadata,
    })
    const componentsMap = new Map<string, Component>()
    for (const cd of entry.componentsData) {
      componentsMap.set(cd.id, cd as unknown as Component)
    }
    cs.loadCircuit(circuit, componentsMap)
  } else {
    cs.clear()
  }
}

export interface SchematicState {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  undoStack: UndoEntry[]
  redoStack: UndoEntry[]

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  addComponentAtPosition: (componentType: string, position: XYPosition) => void
  addGroundAtPosition: (position: XYPosition) => void
  addVddAtPosition: (position: XYPosition) => void
  addImportedComponentNode: (
    compId: string,
    componentType: string,
    reference: string,
    value: string,
    model: string | undefined,
    position: XYPosition,
  ) => void
  removeNodeAndEdges: (nodeId: string) => void
  removeEdge: (edgeId: string) => void
  updateNodeData: (nodeId: string, data: Partial<ComponentNodeData>) => void
  moveNode: (nodeId: string, position: XYPosition) => void
  clear: () => void
  reset: () => void
  undo: () => void
  redo: () => void
  pushUndo: () => void
  getNodeIdForPin: (componentId: string, pinIndex: number) => string | undefined
}

function pinHandleToIndex(handleId: string | null): number | null {
  if (!handleId || !handleId.startsWith('pin-')) return null
  return Number.parseInt(handleId.slice(4), 10)
}

export const useSchematicStore = create<SchematicState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  undoStack: [],
  redoStack: [],

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection: Connection) => {
    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    const circuitStore = useCircuitStore.getState()
    const circuit = circuitStore.circuit
    if (!circuit) return

    const sourcePin = pinHandleToIndex(connection.sourceHandle)
    const targetPin = pinHandleToIndex(connection.targetHandle)
    if (sourcePin === null || targetPin === null) return

    const sourceCompId = connection.source
    const targetCompId = connection.target

    const isGroundSource =
      connection.sourceHandle === 'pin-0' && isPowerNode(sourceCompId, 'ground')
    const isGroundTarget =
      connection.targetHandle === 'pin-0' && isPowerNode(targetCompId, 'ground')
    const isVddSource = connection.sourceHandle === 'pin-0' && isPowerNode(sourceCompId, 'vdd')
    const isVddTarget = connection.targetHandle === 'pin-0' && isPowerNode(targetCompId, 'vdd')

    let circuitNodeId: string | undefined

    if (isGroundSource || isGroundTarget) {
      circuitNodeId = 'GND'
    } else if (isVddSource || isVddTarget) {
      circuitNodeId = 'VDD'
      circuitStore.addNode('VDD', 'signal')
    } else {
      const sourceNode = getNodeIdForPinInternal(circuit, sourceCompId, sourcePin, edges)
      const targetNode = getNodeIdForPinInternal(circuit, targetCompId, targetPin, edges)

      if (sourceNode && targetNode) {
        if (sourceNode === targetNode) {
          circuitNodeId = sourceNode
        } else {
          circuitStore.connect(sourceCompId, sourcePin, sourceNode)
          circuitStore.connect(targetCompId, targetPin, sourceNode)
          mergeCircuitNodes(circuit, targetNode, sourceNode)
          const existingEdge = edges.find(
            (e) =>
              e.source === connection.source &&
              e.target === connection.target &&
              e.sourceHandle === connection.sourceHandle &&
              e.targetHandle === connection.targetHandle,
          )
          if (existingEdge) return
          const edgeId = `${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`
          set({
            edges: [
              ...edges,
              {
                id: edgeId,
                source: connection.source,
                sourceHandle: connection.sourceHandle,
                target: connection.target,
                targetHandle: connection.targetHandle,
                type: 'wire',
              },
            ],
            undoStack: [...get().undoStack, undo],
            redoStack: [],
          })
          return
        }
      } else if (sourceNode) {
        circuitNodeId = sourceNode
      } else if (targetNode) {
        circuitNodeId = targetNode
      } else {
        const newNode = circuitStore.addNode()
        if (newNode) circuitNodeId = newNode.id
      }
    }

    if (!circuitNodeId) return

    if (!(isGroundSource || isGroundTarget)) {
      circuitStore.connect(sourceCompId, sourcePin, circuitNodeId)
      circuitStore.connect(targetCompId, targetPin, circuitNodeId)
    } else if (isGroundSource) {
      circuitStore.connect(targetCompId, targetPin, circuitNodeId)
    } else {
      circuitStore.connect(sourceCompId, sourcePin, circuitNodeId)
    }

    const existingEdge = edges.find(
      (e) =>
        e.source === connection.source &&
        e.target === connection.target &&
        e.sourceHandle === connection.sourceHandle &&
        e.targetHandle === connection.targetHandle,
    )
    if (existingEdge) return

    const edgeId = `${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`
    set({
      edges: [
        ...edges,
        {
          id: edgeId,
          source: connection.source,
          sourceHandle: connection.sourceHandle,
          target: connection.target,
          targetHandle: connection.targetHandle,
          type: 'wire',
        },
      ],
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  addComponentAtPosition: (componentType: string, position: XYPosition) => {
    const reg = componentRegistry[componentType]
    if (!reg) return

    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    const circuitStore = useCircuitStore.getState()
    const nodeId = nextSchematicId()
    const component = reg.createModel(nodeId) as Component
    component.position = { x: position.x, y: position.y }
    circuitStore.addComponent(component)

    const newNode: Node = {
      id: nodeId,
      type: 'component',
      position: { x: position.x - reg.width / 2, y: position.y - reg.height / 2 },
      data: {
        reference: (component as { reference: string }).reference,
        value: (component as { value: string }).value,
        model: (component as { model: string | undefined }).model,
        componentType,
      } satisfies ComponentNodeData,
    }

    set({
      nodes: [...nodes, newNode],
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  addGroundAtPosition: (position: XYPosition) => {
    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    const nodeId = nextSchematicId()
    const newNode: Node = {
      id: nodeId,
      type: 'ground',
      position: { x: position.x - 15, y: position.y - 20 },
      data: {},
    }

    set({
      nodes: [...nodes, newNode],
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  addVddAtPosition: (position: XYPosition) => {
    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    const circuitStore = useCircuitStore.getState()
    const nodeId = nextSchematicId()
    const component = VddSource.create(nodeId)
    component.position = { x: position.x, y: position.y }
    circuitStore.addComponent(component)
    circuitStore.addNode('VDD', 'signal')
    circuitStore.connect(component.id, 1, 'GND')

    const newNode: Node = {
      id: nodeId,
      type: 'vdd',
      position: { x: position.x - 15, y: position.y - 20 },
      data: {
        reference: component.reference,
        value: component.value,
        componentType: 'vdd',
      } satisfies ComponentNodeData,
    }

    set({
      nodes: [...nodes, newNode],
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  addImportedComponentNode: (
    compId: string,
    componentType: string,
    reference: string,
    value: string,
    model: string | undefined,
    position: XYPosition,
  ) => {
    const reg = componentRegistry[componentType]
    if (!reg) return

    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)

    const newNode: Node = {
      id: compId,
      type: 'component',
      position: { x: position.x - reg.width / 2, y: position.y - reg.height / 2 },
      data: {
        reference,
        value,
        model,
        componentType,
      } satisfies ComponentNodeData,
    }

    set({
      nodes: [...nodes, newNode],
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  removeNodeAndEdges: (nodeId: string) => {
    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    const circuitStore = useCircuitStore.getState()

    circuitStore.removeComponent(nodeId)

    const remainingEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId)

    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: remainingEdges,
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  removeEdge: (edgeId: string) => {
    const { nodes, edges } = get()
    const edge = edges.find((e) => e.id === edgeId)
    if (!edge) return

    const undo = createUndoEntry(nodes, edges)
    const circuitStore = useCircuitStore.getState()
    const circuit = circuitStore.circuit
    if (!circuit) return

    const sourcePin = pinHandleToIndex(edge.sourceHandle ?? null)
    const targetPin = pinHandleToIndex(edge.targetHandle ?? null)

    for (const [compId, pin] of [
      [edge.source, sourcePin] as const,
      [edge.target, targetPin] as const,
    ]) {
      if (pin === null) continue
      const conns = circuit.getConnectionsForComponent(compId)
      const conn = conns.find((c) => c.pinIndex === pin)
      if (conn) circuit.removeConnection(conn.id)
    }

    set({
      edges: edges.filter((e) => e.id !== edgeId),
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  updateNodeData: (nodeId: string, data: Partial<ComponentNodeData>) => {
    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    set({
      nodes: nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)),
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  moveNode: (nodeId: string, position: XYPosition) => {
    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    set({
      nodes: nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  clear: () => {
    const { nodes, edges } = get()
    const undo = createUndoEntry(nodes, edges)
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      undoStack: [...get().undoStack, undo],
      redoStack: [],
    })
  },

  reset: () => {
    schematicNodeIdCounter = 0
    set({ nodes: [], edges: [], selectedNodeId: null, undoStack: [], redoStack: [] })
  },

  undo: () => {
    const { undoStack, nodes, edges } = get()
    if (undoStack.length === 0) return
    const entry = undoStack[undoStack.length - 1]
    const currentUndo = createUndoEntry(nodes, edges)
    applyUndoEntry(entry)
    set({
      nodes: entry.nodes,
      edges: entry.edges,
      selectedNodeId: null,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, currentUndo],
    })
  },

  redo: () => {
    const { redoStack, nodes, edges } = get()
    if (redoStack.length === 0) return
    const entry = redoStack[redoStack.length - 1]
    const currentUndo = createUndoEntry(nodes, edges)
    applyUndoEntry(entry)
    set({
      nodes: entry.nodes,
      edges: entry.edges,
      selectedNodeId: null,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, currentUndo],
    })
  },

  pushUndo: () => {
    const { nodes, edges, undoStack } = get()
    set({
      undoStack: [...undoStack, createUndoEntry(nodes, edges)],
      redoStack: [],
    })
  },

  getNodeIdForPin: (componentId: string, pinIndex: number) => {
    const circuitStore = useCircuitStore.getState()
    const circuit = circuitStore.circuit
    if (!circuit) return undefined
    return getNodeIdForPinInternal(circuit, componentId, pinIndex, get().edges)
  },
}))

function getNodeIdForPinInternal(
  circuit: NonNullable<ReturnType<typeof useCircuitStore.getState>['circuit']>,
  componentId: string,
  pinIndex: number,
  _edges: Edge[],
): string | undefined {
  const node = circuit.getPinNode(componentId, pinIndex)
  return node?.id
}

function mergeCircuitNodes(
  circuit: NonNullable<ReturnType<typeof useCircuitStore.getState>['circuit']>,
  sourceNodeId: string,
  targetNodeId: string,
): void {
  if (sourceNodeId === targetNodeId) return
  if (sourceNodeId === 'GND' || targetNodeId === 'GND') return
  if (sourceNodeId === 'VDD' || targetNodeId === 'VDD') return

  for (const conn of circuit.getConnectionsForNode(targetNodeId)) {
    circuit.removeConnection(conn.id)
    circuit.addConnection(conn.componentId, conn.pinIndex, sourceNodeId)
  }
}

function isPowerNode(nodeId: string, type: string): boolean {
  const state = useSchematicStore.getState()
  return state.nodes.some((n) => n.id === nodeId && n.type === type)
}
