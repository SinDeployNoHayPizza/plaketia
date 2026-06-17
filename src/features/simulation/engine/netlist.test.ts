import { Circuit } from '@/features/circuit/model/Circuit.ts'
import { Resistor } from '@/features/components/passive/Resistor.ts'
import { CurrentSource } from '@/features/components/sources/CurrentSource.ts'
import { VddSource } from '@/features/components/sources/VddSource.ts'
import { VoltageSource } from '@/features/components/sources/VoltageSource.ts'
import { describe, expect, it } from 'vitest'
import { generateSimulationNetlist } from './netlist.ts'

function addWire(circuit: Circuit, compId: string, pinIndex: number, nodeLabel?: string) {
  const node = circuit.addNode(nodeLabel)
  circuit.addConnection(compId, pinIndex, node.id)
}

describe('generateSimulationNetlist', () => {
  it('produces .control block for OP analysis', () => {
    const circuit = new Circuit('test', 'Test Circuit')
    const components = new Map()

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('.control')
    expect(netlist).toContain('op')
    expect(netlist).toContain('.endc')
    expect(netlist).toContain('.end')
    expect(netlist).toContain('* Test Circuit')
  })

  it('includes voltage source device line', () => {
    const circuit = new Circuit('test', 'Test')
    const v1 = VoltageSource.create('v1', 'V1')
    v1.value = '5V'
    addWire(circuit, 'v1', 0, 'n001')
    addWire(circuit, 'v1', 1, 'n002')
    const components = new Map([['v1', v1]])

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('V1 n001 n002 5V')
  })

  it('includes resistor device line', () => {
    const circuit = new Circuit('test', 'Test')
    const r1 = Resistor.create('r1', 'R1')
    r1.value = '1k'
    addWire(circuit, 'r1', 0, 'n001')
    addWire(circuit, 'r1', 1, 'GND')
    const components = new Map([['r1', r1]])

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('R1 n001 0 1k')
  })

  it('prints node voltages for OP analysis', () => {
    const circuit = new Circuit('test', 'Test')
    circuit.addNode('n001')
    const components = new Map()

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('===NODE_VOLTAGES===')
    expect(netlist).toContain('print v(n001)')
  })

  it('includes transient analysis block', () => {
    const circuit = new Circuit('test', 'Test')
    const components = new Map()

    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'tran',
      params: { stopTime: 1e-3, maxStep: 1e-5 },
    })

    expect(netlist).toContain('tran 0.00001 0.001')
    expect(netlist).toContain('===TRAN_START===')
    expect(netlist).toContain('===TRAN_END===')
  })

  it('includes DC sweep block', () => {
    const circuit = new Circuit('test', 'Test')
    const components = new Map()

    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'dc',
      params: { sourceName: 'V1', startValue: 0, stopValue: 5, stepValue: 0.5 },
    })

    expect(netlist).toContain('dc V1 0 5 0.5')
    expect(netlist).toContain('===DC_SWEEP_START===')
    expect(netlist).toContain('===DC_SWEEP_END===')
  })

  it('ignores GND node in print list', () => {
    const circuit = new Circuit('test', 'Test')
    circuit.addNode('n001')
    circuit.addNode('n002')
    const components = new Map()

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('print v(n001) v(n002)')
    expect(netlist).not.toContain('v(gnd)')
    expect(netlist).not.toContain('v(0)')
  })
})
