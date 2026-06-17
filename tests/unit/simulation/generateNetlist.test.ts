import { Circuit } from '@/features/circuit/model/Circuit.ts'
import { Capacitor } from '@/features/components/passive/Capacitor.ts'
import { Resistor } from '@/features/components/passive/Resistor.ts'
import { generateSimulationNetlist } from '@/features/simulation/engine/netlist.ts'
import { beforeEach, describe, expect, it } from 'vitest'

describe('generateSimulationNetlist', () => {
  let circuit: Circuit
  let components: Map<string, import('@/features/components/base/types.ts').Component>

  beforeEach(() => {
    circuit = new Circuit('test', 'Test Circuit')
    components = new Map()
  })

  it('generates a netlist with header and .end', () => {
    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'op',
      params: {},
    })
    expect(netlist).toContain('* Test Circuit')
    expect(netlist).toContain('.control')
    expect(netlist).toContain('.endc')
    expect(netlist).toContain('.end')
  })

  it('includes op analysis directives when nodes exist', () => {
    const r1 = Resistor.create('r1', 'R1')
    r1.value = '10k'
    circuit.addNode('N001', 'signal')
    circuit.addConnection('r1', 0, 'N001')
    circuit.addConnection('r1', 1, 'GND')
    components.set('r1', r1)

    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'op',
      params: {},
    })
    expect(netlist).toContain('op')
    expect(netlist).toContain('===NODE_VOLTAGES===')
    expect(netlist).toContain('===BRANCH_CURRENTS===')
  })

  it('includes tran analysis with configurable params', () => {
    circuit.addNode('N001', 'signal')
    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'tran',
      params: { stopTime: 1e-3, maxStep: 1e-6 },
    })
    expect(netlist).toContain('tran')
    expect(netlist).toContain('===TRAN_START===')
    expect(netlist).toContain('===TRAN_END===')
  })

  it('includes tran markers even without signal nodes', () => {
    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'tran',
      params: {},
    })
    expect(netlist).toContain('===TRAN_START===')
    expect(netlist).toContain('===TRAN_END===')
  })

  it('includes dc sweep analysis', () => {
    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'dc',
      params: { sourceName: 'V1', startValue: 0, stopValue: 5, stepValue: 0.5 },
    })
    expect(netlist).toContain('dc V1 0 5 0.5')
    expect(netlist).toContain('===DC_SWEEP_START===')
    expect(netlist).toContain('===DC_SWEEP_END===')
  })

  it('includes device lines in the netlist', () => {
    const r1 = Resistor.create('r1', 'R1')
    r1.value = '10k'
    circuit.addNode('N001', 'signal')
    circuit.addNode('N002', 'signal')
    circuit.addConnection('r1', 0, 'N001')
    circuit.addConnection('r1', 1, 'GND')
    components.set('r1', r1)

    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'op',
      params: {},
    })
    expect(netlist).toContain('R1')
    expect(netlist).toContain('10k')
    expect(netlist).toContain('N001')
    expect(netlist).toContain('GND')
  })

  it('prints node voltages for signal nodes', () => {
    const r1 = Resistor.create('r1', 'R1')
    r1.value = '10k'
    circuit.addNode('N001', 'signal')
    circuit.addNode('N002', 'signal')
    circuit.addConnection('r1', 0, 'N001')
    circuit.addConnection('r1', 1, 'GND')
    components.set('r1', r1)

    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'op',
      params: {},
    })
    expect(netlist).toContain('v(N001)')
    expect(netlist).toContain('v(N002)')
  })

  it('uses default params when not specified', () => {
    const netlist = generateSimulationNetlist(circuit, components, {
      analysis: 'tran',
      params: {},
    })
    expect(netlist).toContain('tran 0.0001 0.01')
  })
})
