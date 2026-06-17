import { useCircuitStore } from '@/features/circuit/store.ts'
import type { Component } from '@/features/components/base/types.ts'
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

export interface SchematicState {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  addComponentAtPosition: (componentType: string, position: XYPosition) => void
  addGroundAtPosition: (position: XYPosition) => void
  removeNodeAndEdges: (nodeId: string) => void
  updateNodeData: (nodeId: string, data: Partial<ComponentNodeData>) => void
  clear: () => void
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

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection: Connection) => {
    const { edges } = get()
    const circuitStore = useCircuitStore.getState()
    const circuit = circuitStore.circuit
    if (!circuit) return

    const sourcePin = pinHandleToIndex(connection.sourceHandle)
    const targetPin = pinHandleToIndex(connection.targetHandle)
    if (sourcePin === null || targetPin === null) return

    const sourceCompId = connection.source
    const targetCompId = connection.target

    const isGroundSource = connection.sourceHandle === 'pin-0' && isGroundNode(sourceCompId)
    const isGroundTarget = connection.targetHandle === 'pin-0' && isGroundNode(targetCompId)

    let circuitNodeId: string | undefined

    if (isGroundSource || isGroundTarget) {
      circuitNodeId = 'GND'
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
    })
  },

  addComponentAtPosition: (componentType: string, position: XYPosition) => {
    const reg = componentRegistry[componentType]
    if (!reg) return

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

    set({ nodes: [...get().nodes, newNode] })
  },

  addGroundAtPosition: (position: XYPosition) => {
    const nodeId = nextSchematicId()
    const newNode: Node = {
      id: nodeId,
      type: 'ground',
      position: { x: position.x - 15, y: position.y - 20 },
      data: {},
    }

    set({ nodes: [...get().nodes, newNode] })
  },

  removeNodeAndEdges: (nodeId: string) => {
    const circuitStore = useCircuitStore.getState()
    const { nodes, edges } = get()

    circuitStore.removeComponent(nodeId)

    const remainingEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId)

    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: remainingEdges,
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    })
  },

  updateNodeData: (nodeId: string, data: Partial<ComponentNodeData>) => {
    const { nodes } = get()
    set({
      nodes: nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)),
    })
  },

  clear: () => {
    set({ nodes: [], edges: [], selectedNodeId: null })
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

  for (const conn of circuit.getConnectionsForNode(targetNodeId)) {
    circuit.removeConnection(conn.id)
    circuit.addConnection(conn.componentId, conn.pinIndex, sourceNodeId)
  }
}

function isGroundNode(nodeId: string): boolean {
  return nodeId.startsWith('sc-')
}
