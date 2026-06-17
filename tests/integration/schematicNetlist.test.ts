import { describe, expect, it } from 'vitest'
import {
  applyImportToCircuit,
  generateNetlist,
  importNetlist,
} from '../../src/features/circuit/io/spiceNetlist.ts'
import { Circuit } from '../../src/features/circuit/model/Circuit.ts'
import { Capacitor } from '../../src/features/components/passive/Capacitor.ts'
import { Inductor } from '../../src/features/components/passive/Inductor.ts'
import { Resistor } from '../../src/features/components/passive/Resistor.ts'

describe('SPICE round-trip: schematic → netlist → circuit', () => {
  it('round-trips a resistor voltage divider', () => {
    const circuit = new Circuit('test', 'Voltage Divider')
    const r1 = Resistor.create('r1', 'R1')
    r1.value = '10k'
    const r2 = Resistor.create('r2', 'R2')
    r2.value = '2.2k'

    const n1 = circuit.addNode('N001')
    const n2 = circuit.addNode('N002')

    circuit.addConnection('r1', 0, n1.id)
    circuit.addConnection('r1', 1, n2.id)
    circuit.addConnection('r2', 0, n2.id)
    circuit.addConnection('r2', 1, 'GND')

    const components = new Map([
      ['r1', r1],
      ['r2', r2],
    ])

    const netlist = generateNetlist(circuit, components)
    const result = importNetlist(netlist)

    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(2)

    const r1i = result.components.find((c) => c.reference === 'R1')
    const r2i = result.components.find((c) => c.reference === 'R2')
    expect(r1i).toBeDefined()
    expect(r2i).toBeDefined()
    expect(r1i!.value).toBe('10k')
    expect(r2i!.value).toBe('2.2k')

    const importedCircuit = new Circuit('test2', 'Imported')
    const importedComponents = applyImportToCircuit(importedCircuit, result)
    expect(importedComponents.size).toBe(2)

    const r1Node0 = importedCircuit.getPinNode('R1', 0)
    const r1Node1 = importedCircuit.getPinNode('R1', 1)
    expect(r1Node0).toBeDefined()
    expect(r1Node1).toBeDefined()
  })

  it('round-trips an RLC circuit', () => {
    const circuit = new Circuit('test', 'RLC Filter')
    const r1 = Resistor.create('r1', 'R1')
    r1.value = '1k'
    const c1 = Capacitor.create('c1', 'C1')
    c1.value = '100nF'
    const l1 = Inductor.create('l1', 'L1')
    l1.value = '10mH'

    const n1 = circuit.addNode('N001')

    circuit.addConnection('r1', 0, n1.id)
    circuit.addConnection('r1', 1, 'GND')
    circuit.addConnection('c1', 0, n1.id)
    circuit.addConnection('c1', 1, 'GND')
    circuit.addConnection('l1', 0, n1.id)
    circuit.addConnection('l1', 1, 'GND')

    const components = new Map([
      ['r1', r1],
      ['c1', c1],
      ['l1', l1],
    ])

    const netlist = generateNetlist(circuit, components)
    const result = importNetlist(netlist)

    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(3)
    expect(result.components.some((c) => c.reference === 'R1' && c.value === '1k')).toBe(true)
    expect(result.components.some((c) => c.reference === 'C1' && c.value === '100nF')).toBe(true)
    expect(result.components.some((c) => c.reference === 'L1' && c.value === '10mH')).toBe(true)
  })

  it('netlist contains .end and title header', () => {
    const circuit = new Circuit('test', 'MyCircuit')
    const netlist = generateNetlist(circuit, new Map())
    expect(netlist).toContain('* MyCircuit')
    expect(netlist).toContain('.end')
  })

  it('imported components have correct pin connections from netlist', () => {
    const circuit = new Circuit('test', 'Bridge')
    const r1 = Resistor.create('r1', 'R1')
    r1.value = '10k'

    const n1 = circuit.addNode('N001')
    circuit.addConnection('r1', 0, n1.id)
    circuit.addConnection('r1', 1, 'GND')

    const netlist = generateNetlist(circuit, new Map([['r1', r1]]))
    const result = importNetlist(netlist)
    const importedCircuit = new Circuit('test2', 'Bridge')
    applyImportToCircuit(importedCircuit, result)

    const pin0 = importedCircuit.getPinNode('R1', 0)
    const pin1 = importedCircuit.getPinNode('R1', 1)
    expect(pin0?.id).toBe('N001')
    expect(pin1?.id).toBe('GND')
  })
})
