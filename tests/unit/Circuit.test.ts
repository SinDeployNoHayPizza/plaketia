import { describe, expect, it } from 'vitest'
import { Circuit } from '../../src/features/circuit/model/Circuit.ts'

describe('Circuit', () => {
  it('creates a circuit with GND node by default', () => {
    const circuit = new Circuit('test-1', 'Test Circuit')
    expect(circuit.metadata.name).toBe('Test Circuit')
    expect(circuit.nodes.has('GND')).toBe(true)
    expect(circuit.nodes.get('GND')?.type).toBe('ground')
  })

  it('adds nodes with auto-generated IDs', () => {
    const circuit = new Circuit('test-2')
    const node = circuit.addNode('VCC', 'power')
    expect(node.type).toBe('power')
    expect(node.label).toBe('VCC')
    expect(circuit.nodes.has(node.id)).toBe(true)
  })

  it('adds node with default label and type', () => {
    const circuit = new Circuit('test-3')
    const node = circuit.addNode()
    expect(node.label).toBe(node.id)
    expect(node.type).toBe('signal')
  })

  it('does not remove GND node', () => {
    const circuit = new Circuit('test-4')
    circuit.removeNode('GND')
    expect(circuit.nodes.has('GND')).toBe(true)
  })

  it('removes a node and its connections', () => {
    const circuit = new Circuit('test-5')
    const node = circuit.addNode('N1')
    const _conn = circuit.addConnection('R1', 1, node.id)
    circuit.removeNode(node.id)
    expect(circuit.nodes.has(node.id)).toBe(false)
    expect(circuit.connections).toHaveLength(0)
  })

  it('gets node by id', () => {
    const circuit = new Circuit('test-6')
    const node = circuit.addNode('INPUT')
    expect(circuit.getNode(node.id)).toBe(node)
    expect(circuit.getNode('NONEXISTENT')).toBeUndefined()
  })

  it('adds connections', () => {
    const circuit = new Circuit('test-7')
    const node = circuit.addNode('N1')
    const conn = circuit.addConnection('R1', 1, node.id)
    expect(conn.componentId).toBe('R1')
    expect(conn.pinIndex).toBe(1)
    expect(conn.nodeId).toBe(node.id)
    expect(circuit.connections).toHaveLength(1)
  })

  it('removes a connection', () => {
    const circuit = new Circuit('test-8')
    const node = circuit.addNode('N1')
    const conn = circuit.addConnection('R1', 1, node.id)
    expect(circuit.connections).toHaveLength(1)
    circuit.removeConnection(conn.id)
    expect(circuit.connections).toHaveLength(0)
  })

  it('gets connections for a node', () => {
    const circuit = new Circuit('test-9')
    const n1 = circuit.addNode('N1')
    const n2 = circuit.addNode('N2')
    circuit.addConnection('R1', 1, n1.id)
    circuit.addConnection('R1', 2, n2.id)
    circuit.addConnection('C1', 1, n1.id)
    expect(circuit.getConnectionsForNode(n1.id)).toHaveLength(2)
    expect(circuit.getConnectionsForNode(n2.id)).toHaveLength(1)
  })

  it('gets connections for a component', () => {
    const circuit = new Circuit('test-10')
    const n1 = circuit.addNode('N1')
    const n2 = circuit.addNode('N2')
    circuit.addConnection('R1', 1, n1.id)
    circuit.addConnection('R1', 2, n2.id)
    circuit.addConnection('C1', 1, n1.id)
    expect(circuit.getConnectionsForComponent('R1')).toHaveLength(2)
    expect(circuit.getConnectionsForComponent('C1')).toHaveLength(1)
  })

  it('gets pin node for a component pin', () => {
    const circuit = new Circuit('test-11')
    const node = circuit.addNode('N1')
    circuit.addConnection('R1', 1, node.id)
    const pinNode = circuit.getPinNode('R1', 1)
    expect(pinNode?.id).toBe(node.id)
    expect(circuit.getPinNode('R1', 99)).toBeUndefined()
  })

  it('merges two pins of the same component', () => {
    const circuit = new Circuit('test-12')
    const n1 = circuit.addNode('N1')
    const n2 = circuit.addNode('N2')
    circuit.addConnection('R1', 1, n1.id)
    circuit.addConnection('R1', 2, n2.id)
    const merged = circuit.mergeConnections('R1', 1, 2)
    expect(merged).toBe(n1.id)
    expect(circuit.nodes.has(n2.id)).toBe(false)
  })

  it('serializes to JSON and back', () => {
    const circuit = new Circuit('test-13', 'My Circuit')
    const n1 = circuit.addNode('INPUT')
    circuit.addConnection('R1', 1, n1.id)
    circuit.addConnection('R1', 2, 'GND')

    const json = circuit.toJSON()
    const restored = Circuit.fromJSON(json)

    expect(restored.id).toBe(circuit.id)
    expect(restored.metadata.name).toBe('My Circuit')
    expect(restored.nodes.size).toBe(circuit.nodes.size)
    expect(restored.connections).toHaveLength(circuit.connections.length)
  })

  it('updates metadata on touch', () => {
    const circuit = new Circuit('test-14')
    const original = new Date(circuit.metadata.modified).getTime()
    circuit.addNode()
    const updated = new Date(circuit.metadata.modified).getTime()
    expect(updated).toBeGreaterThanOrEqual(original)
  })

  it('provides a copy of metadata', () => {
    const circuit = new Circuit('test-15', 'Test')
    const md = circuit.metadata
    md.name = 'Changed'
    expect(circuit.metadata.name).toBe('Test')
  })
})
