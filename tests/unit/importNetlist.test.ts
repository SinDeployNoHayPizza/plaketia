import { describe, expect, it } from 'vitest'
import { applyImportToCircuit, importNetlist } from '../../src/features/circuit/io/spiceNetlist.ts'
import { Circuit } from '../../src/features/circuit/model/Circuit.ts'

describe('importNetlist', () => {
  it('parses a simple resistor divider netlist', () => {
    const netlist = ['* Voltage Divider', 'R1 N001 N002 10k', 'R2 N002 0 2.2k', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.title).toBe('Voltage Divider')
    expect(result.components).toHaveLength(2)
    expect(result.errors).toHaveLength(0)
    expect(result.deviceNodes.get('R1')).toEqual(['N001', 'N002'])
    expect(result.deviceNodes.get('R2')).toEqual(['N002', '0'])
  })

  it('parses components with model names (BJT)', () => {
    const netlist = ['* BJT Circuit', 'Q1 N001 N002 N003 2N2222', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].reference).toBe('Q1')
    expect(result.components[0].model).toBe('2N2222')
    expect(result.deviceNodes.get('Q1')).toEqual(['N001', 'N002', 'N003'])
  })

  it('handles empty netlist', () => {
    const result = importNetlist('')
    expect(result.components).toHaveLength(0)
    expect(result.errors).toHaveLength(0)
  })

  it('ignores comments and handles .end', () => {
    const netlist = ['* Title', 'R1 N001 0 1k', '.end', 'R2 N002 0 2k'].join('\n')
    const result = importNetlist(netlist)
    expect(result.components).toHaveLength(1)
  })

  it('reports unknown device prefix', () => {
    const netlist = ['X1 N001 N002 OPAMP', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors.some((e) => e.includes('Unknown device prefix'))).toBe(true)
  })

  it('reports duplicate references', () => {
    const netlist = ['R1 N001 0 1k', 'R1 N002 0 2k', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors.some((e) => e.includes('Duplicate reference'))).toBe(true)
  })

  it('handles inline comments after semicolon', () => {
    const netlist = ['R1 N001 0 10k ; this is a comment', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].value).toBe('10k')
  })

  it('parses MOSFET (M) with 4 nodes and model', () => {
    const netlist = ['M1 N001 N002 N003 N004 IRF530', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].reference).toBe('M1')
    expect(result.components[0].type).toBe('mosfet-n')
    expect(result.components[0].model).toBe('IRF530')
    expect(result.deviceNodes.get('M1')).toEqual(['N001', 'N002', 'N003', 'N004'])
  })

  it('parses JFET (J) with 3 nodes and model', () => {
    const netlist = ['J1 N001 N002 N003 2N5457', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].reference).toBe('J1')
    expect(result.components[0].type).toBe('jfet-n')
    expect(result.components[0].model).toBe('2N5457')
    expect(result.deviceNodes.get('J1')).toEqual(['N001', 'N002', 'N003'])
  })

  it('handles .model directives without error', () => {
    const netlist = [
      '* Test',
      '.model 2N2222 NPN(IS=1e-14 BF=200)',
      'Q1 N001 N002 N003 2N2222',
      '.end',
    ].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(1)
    expect(result.models.size).toBe(1)
    expect(result.models.has('2N2222')).toBe(true)
    expect(result.models.get('2N2222')?.type).toBe('NPN')
  })

  it('skips .subckt / .ends blocks', () => {
    const netlist = [
      '* With subcircuit',
      '.subckt OPAMP 1 2 3',
      'R1 1 2 10k',
      '.ends',
      'R2 N001 0 1k',
      '.end',
    ].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].reference).toBe('R2')
  })

  it('handles line continuation with +', () => {
    const netlist = ['* Cont', 'R1 N001 N002', '+ 10k', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].value).toBe('10k')
  })

  it('parses extended source format (DC)', () => {
    const netlist = ['V1 N001 0 DC 15V', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].reference).toBe('V1')
    expect(result.components[0].value).toBe('DC 15V')
  })

  it('parses source with SINE function', () => {
    const netlist = ['V1 N001 0 SINE(0 1 1k)', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components[0].value).toBe('SINE(0 1 1k)')
  })

  it('collects .tran analysis directives', () => {
    const netlist = ['* Test', 'R1 N001 0 1k', '.tran 1ms 10ms', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.analysis).toHaveLength(1)
    expect(result.analysis[0]).toBe('.tran 1ms 10ms')
  })

  it('handles value without suffix', () => {
    const netlist = ['R1 N001 0 1000', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components[0].value).toBe('1000')
  })

  it('handles multi-node MOSFET with bulk tied to source', () => {
    const netlist = ['M1 N001 N002 N003 N003 IRF530', '.end'].join('\n')
    const result = importNetlist(netlist)
    expect(result.errors).toHaveLength(0)
    expect(result.components[0].reference).toBe('M1')
    expect(result.deviceNodes.get('M1')).toEqual(['N001', 'N002', 'N003', 'N003'])
  })
})

describe('applyImportToCircuit', () => {
  it('populates a circuit from import result', () => {
    const netlist = ['* Test', 'R1 N001 0 10k', 'C1 N001 0 100nF', '.end'].join('\n')
    const result = importNetlist(netlist)
    const circuit = new Circuit('test', 'Test')
    const components = applyImportToCircuit(circuit, result)

    expect(components.size).toBe(2)
    expect(circuit.getNode('N001')).toBeDefined()
    expect(circuit.getNode('GND')).toBeDefined()

    const r1Node = circuit.getPinNode('R1', 0)
    expect(r1Node?.id).toBe('N001')
    const r1Gnd = circuit.getPinNode('R1', 1)
    expect(r1Gnd?.id).toBe('GND')
  })
})
