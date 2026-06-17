import { describe, expect, it } from 'vitest'
import { generateNetlist } from '../../src/features/circuit/io/spiceNetlist.ts'
import { Circuit } from '../../src/features/circuit/model/Circuit.ts'
import { Capacitor } from '../../src/features/components/passive/Capacitor.ts'
import { Resistor } from '../../src/features/components/passive/Resistor.ts'

describe('generateNetlist', () => {
  it('generates header with circuit name', () => {
    const circuit = new Circuit('test', 'Voltage Divider')
    const components = new Map()
    const netlist = generateNetlist(circuit, components)
    expect(netlist).toContain('* Voltage Divider')
    expect(netlist).toContain('.end')
  })

  it('includes component SPICE lines with resolved nodes', () => {
    const circuit = new Circuit('test', 'Test')
    const r1 = Resistor.create('r1')
    r1.value = '10k'
    r1.reference = 'R1'
    const r2 = Resistor.create('r2')
    r2.value = '2.2k'
    r2.reference = 'R2'

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
    expect(netlist).toContain('R1 N001 N002 10k')
    expect(netlist).toContain('R2 N002 GND 2.2k')
  })

  it('handles empty components map', () => {
    const circuit = new Circuit('test', 'Empty')
    const netlist = generateNetlist(circuit, new Map())
    expect(netlist).toContain('* Empty')
    expect(netlist).toContain('.end')
  })

  it('does not include components without connections', () => {
    const circuit = new Circuit('test', 'Test')
    const r1 = Resistor.create('r1')
    r1.value = '1k'
    r1.reference = 'R1'

    const netlist = generateNetlist(circuit, new Map([['r1', r1]]))
    expect(netlist).toContain('.end')
  })
})
