import { describe, expect, it } from 'vitest'
import { Circuit } from '../../src/features/circuit/model/Circuit.ts'
import { runErc } from '../../src/features/circuit/validation/erc.ts'
import { Resistor } from '../../src/features/components/passive/Resistor.ts'

describe('runErc', () => {
  it('warns about missing ground for empty circuit with no components', () => {
    const circuit = new Circuit('test', 'Empty')
    const result = runErc(circuit, new Map())
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].code).toBe('NO_GROUND')
  })

  it('warns on unconnected passive pins', () => {
    const circuit = new Circuit('test', 'Test')
    const r1 = Resistor.create('r1')
    r1.reference = 'R1'
    const result = runErc(circuit, new Map([['r1', r1]]))
    expect(result.issues.some((i) => i.code === 'UNCONNECTED_PIN')).toBe(true)
    expect(result.warningCount).toBeGreaterThan(0)
  })

  it('flags duplicate references', () => {
    const circuit = new Circuit('test', 'Test')
    const r1 = Resistor.create('r1')
    r1.reference = 'R1'
    const r2 = Resistor.create('r2')
    r2.reference = 'R1'
    const result = runErc(
      circuit,
      new Map([
        ['r1', r1],
        ['r2', r2],
      ]),
    )
    expect(result.issues.some((i) => i.code === 'DUPLICATE_REFERENCE')).toBe(true)
    expect(result.errorCount).toBeGreaterThan(0)
  })

  it('warns on no ground reference', () => {
    const circuit = new Circuit('test', 'Test')
    const r1 = Resistor.create('r1')
    r1.reference = 'R1'
    const n1 = circuit.addNode('N001')
    circuit.addConnection('r1', 0, n1.id)
    circuit.addConnection('r1', 1, n1.id)
    const result = runErc(circuit, new Map([['r1', r1]]))
    expect(result.issues.some((i) => i.code === 'NO_GROUND')).toBe(true)
  })

  it('passes a properly connected circuit with ground', () => {
    const circuit = new Circuit('test', 'Voltage Divider')
    const r1 = Resistor.create('r1')
    r1.value = '10k'
    r1.reference = 'R1'
    const r2 = Resistor.create('r2')
    r2.value = '2.2k'
    r2.reference = 'R2'

    const n1 = circuit.addNode('VCC')
    const n2 = circuit.addNode('OUT')
    circuit.addConnection('r1', 0, n1.id)
    circuit.addConnection('r1', 1, n2.id)
    circuit.addConnection('r2', 0, n2.id)
    circuit.addConnection('r2', 1, 'GND')

    const result = runErc(
      circuit,
      new Map([
        ['r1', r1],
        ['r2', r2],
      ]),
    )
    expect(result.valid).toBe(true)
    expect(result.errorCount).toBe(0)
  })
})
