import type { CircuitData, CircuitMetadata, CircuitNode, Connection } from './types.ts'

let nextNodeId = 1

function generateNodeId(): string {
  return `N${String(nextNodeId++).padStart(3, '0')}`
}

export class Circuit {
  readonly id: string
  private _nodes: Map<string, CircuitNode>
  private _connections: Connection[]
  private _metadata: CircuitMetadata

  constructor(id: string, name = 'Untitled') {
    this.id = id
    this._nodes = new Map()
    this._connections = []
    this._metadata = {
      name,
      description: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }
    this.addNode('GND', 'ground')
  }

  get nodes(): ReadonlyMap<string, CircuitNode> {
    return this._nodes
  }

  get connections(): readonly Connection[] {
    return this._connections
  }

  get metadata(): CircuitMetadata {
    return { ...this._metadata }
  }

  set metadata(md: Partial<CircuitMetadata>) {
    this._metadata = { ...this._metadata, ...md, modified: new Date().toISOString() }
  }

  addNode(label?: string, type: CircuitNode['type'] = 'signal'): CircuitNode {
    const id = label ?? generateNodeId()
    const existing = this._nodes.get(id)
    if (existing) return existing
    const node: CircuitNode = { id, label: label ?? id, type }
    this._nodes.set(id, node)
    this._touch()
    return node
  }

  removeNode(nodeId: string): void {
    if (nodeId === 'GND') return
    this._nodes.delete(nodeId)
    this._connections = this._connections.filter((c) => c.nodeId !== nodeId)
    this._touch()
  }

  getNode(nodeId: string): CircuitNode | undefined {
    return this._nodes.get(nodeId)
  }

  addConnection(componentId: string, pinIndex: number, nodeId: string): Connection {
    const conn: Connection = {
      id: `${componentId}-${pinIndex}-${nodeId}`,
      nodeId,
      componentId,
      pinIndex,
    }
    this._connections.push(conn)
    this._touch()
    return conn
  }

  removeConnection(connectionId: string): void {
    this._connections = this._connections.filter((c) => c.id !== connectionId)
    this._touch()
  }

  getConnectionsForNode(nodeId: string): Connection[] {
    return this._connections.filter((c) => c.nodeId === nodeId)
  }

  getConnectionsForComponent(componentId: string): Connection[] {
    return this._connections.filter((c) => c.componentId === componentId)
  }

  getPinNode(componentId: string, pinIndex: number): CircuitNode | undefined {
    const conn = this._connections.find(
      (c) => c.componentId === componentId && c.pinIndex === pinIndex,
    )
    if (!conn) return undefined
    return this._nodes.get(conn.nodeId)
  }

  mergeConnections(componentId: string, pinIndexA: number, pinIndexB: number): string | undefined {
    const nodeA = this.getPinNode(componentId, pinIndexA)
    const nodeB = this.getPinNode(componentId, pinIndexB)
    if (!nodeA || !nodeB) return undefined
    if (nodeA.id === nodeB.id) return nodeA.id

    for (const conn of this._connections) {
      if (conn.nodeId === nodeB.id && conn.componentId !== componentId) {
        conn.nodeId = nodeA.id
      }
    }
    this._nodes.delete(nodeB.id)
    this._touch()
    return nodeA.id
  }

  toJSON(): CircuitData {
    return {
      id: this.id,
      nodes: this._nodes,
      connections: [...this._connections],
      metadata: this._metadata,
    }
  }

  static fromJSON(data: CircuitData): Circuit {
    const circuit = new Circuit(data.id, data.metadata.name)
    circuit._nodes = data.nodes
    circuit._connections = data.connections
    circuit._metadata = data.metadata
    return circuit
  }

  private _touch(): void {
    this._metadata.modified = new Date().toISOString()
  }
}
