import { Circuit } from '@/features/circuit/model/Circuit.ts'
import { Ammeter } from '@/features/components/instruments/Ammeter.ts'
import { Voltmeter } from '@/features/components/instruments/Voltmeter.ts'
import { Resistor } from '@/features/components/passive/Resistor.ts'
import { CurrentSource } from '@/features/components/sources/CurrentSource.ts'
import { FunctionGenerator } from '@/features/components/sources/FunctionGenerator.ts'
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

  it('ammeter generates a 0V voltage source for current sensing', () => {
    const circuit = new Circuit('test', 'Test')
    const am1 = Ammeter.create('am1', 'AM1')
    addWire(circuit, 'am1', 0, 'n001')
    addWire(circuit, 'am1', 1, 'n002')
    const components = new Map([['am1', am1]])

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('VAM1 n001 n002 DC 0')
  })

  it('voltmeter outputs a SPICE comment line', () => {
    const circuit = new Circuit('test', 'Test')
    const vm1 = Voltmeter.create('vm1', 'VM1')
    addWire(circuit, 'vm1', 0, 'n001')
    addWire(circuit, 'vm1', 1, 'GND')
    const components = new Map([['vm1', vm1]])

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('*VM1 voltmeter VM1')
  })

  it('function generator uses prefix V for SPICE type', () => {
    const circuit = new Circuit('test', 'Test')
    const fg1 = FunctionGenerator.create('fg1', 'FG1')
    fg1.metadata.waveform = 'sine'
    fg1.metadata.amplitude = '3'
    fg1.metadata.frequency = '1k'
    addWire(circuit, 'fg1', 0, 'n001')
    addWire(circuit, 'fg1', 1, 'GND')
    const components = new Map([['fg1', fg1]])

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('VFG1 n001 0 SINE')
    expect(netlist).toContain('SINE(0 3 1k)')
  })

  it('current source uses prefix I for SPICE type', () => {
    const circuit = new Circuit('test', 'Test')
    const i1 = CurrentSource.create('i1', 'I1')
    i1.value = '1mA'
    addWire(circuit, 'i1', 0, 'n001')
    addWire(circuit, 'i1', 1, 'GND')
    const components = new Map([['i1', i1]])

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('I1 n001 0 1mA')
  })

  it('VDD source generates correct SPICE line', () => {
    const circuit = new Circuit('test', 'Test')
    const vdd = VddSource.create('vdd1', 'VDD1')
    vdd.value = '3.3V'
    addWire(circuit, 'vdd1', 0, 'VDD')
    circuit.addConnection('vdd1', 1, 'GND')
    const components = new Map([['vdd1', vdd]])

    const netlist = generateSimulationNetlist(circuit, components, { analysis: 'op', params: {} })

    expect(netlist).toContain('VDD1 VDD 0 3.3V')
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
