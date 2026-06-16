export interface CircuitNode {
  id: string
  label: string
  type: 'signal' | 'power' | 'ground'
}

export interface Connection {
  id: string
  nodeId: string
  componentId: string
  pinIndex: number
}

export interface CircuitMetadata {
  name: string
  description: string
  created: string
  modified: string
}

export interface CircuitData {
  id: string
  nodes: Map<string, CircuitNode>
  connections: Connection[]
  metadata: CircuitMetadata
}
