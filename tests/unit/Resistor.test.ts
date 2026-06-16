import { describe, expect, it } from 'vitest'
import { Resistor } from '../../src/features/components/passive/Resistor.ts'

describe('Resistor', () => {
  it('creates a resistor with default values', () => {
    const r = Resistor.create('r1')
    expect(r.type).toBe('resistor')
    expect(r.reference).toBe('R1')
    expect(r.value).toBe('1k')
    expect(r.pins).toHaveLength(2)
  })

  it('generates SPICE netlist line', () => {
    const r = Resistor.create('r1')
    r.value = '10k'
    const line = r.toSpiceDeviceLine()
    expect(line.prefix).toBe('R')
    expect(line.value).toBe('10k')
  })

  it('fails validation without value', () => {
    const r = Resistor.create('r1')
    r.value = ''
    const result = r.validate()
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Resistor value is required')
  })

  it('passes validation with value', () => {
    const r = Resistor.create('r1')
    const result = r.validate()
    expect(result.valid).toBe(true)
  })

  it('clones correctly', () => {
    const r = Resistor.create('r1')
    r.value = '47k'
    r.position = { x: 100, y: 200 }
    const clone = r.clone()
    expect(clone.id).toBe(r.id)
    expect(clone.value).toBe('47k')
    expect(clone.position.x).toBe(100)
    expect(clone.position.y).toBe(200)
    expect(clone.reference).toBe(r.reference)
  })
})
