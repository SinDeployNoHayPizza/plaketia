import { describe, expect, it } from 'vitest'
import { Capacitor } from '../../src/features/components/passive/Capacitor.ts'

describe('Capacitor', () => {
  it('creates a capacitor with default values', () => {
    const c = Capacitor.create('c1')
    expect(c.type).toBe('capacitor')
    expect(c.reference).toBe('C1')
    expect(c.value).toBe('100nF')
    expect(c.pins).toHaveLength(2)
    expect(c.pins[0].name).toBe('+')
  })

  it('generates SPICE netlist line', () => {
    const c = Capacitor.create('c1')
    const line = c.toSpiceDeviceLine()
    expect(line.prefix).toBe('C')
    expect(line.value).toBe('100nF')
  })

  it('clones correctly', () => {
    const c = Capacitor.create('c1')
    c.value = '10uF'
    const clone = c.clone()
    expect(clone.value).toBe('10uF')
    expect(clone.type).toBe('capacitor')
  })
})
