import { describe, expect, it } from 'vitest'
import { Inductor } from '../../src/features/components/passive/Inductor.ts'

describe('Inductor', () => {
  it('creates an inductor with default values', () => {
    const l = Inductor.create('l1')
    expect(l.type).toBe('inductor')
    expect(l.value).toBe('10mH')
    expect(l.pins).toHaveLength(2)
  })

  it('generates SPICE netlist line', () => {
    const l = Inductor.create('l1')
    const line = l.toSpiceDeviceLine()
    expect(line.prefix).toBe('L')
    expect(line.value).toBe('10mH')
  })

  it('clones correctly', () => {
    const l = Inductor.create('l1')
    l.value = '100uH'
    const clone = l.clone()
    expect(clone.value).toBe('100uH')
  })
})
