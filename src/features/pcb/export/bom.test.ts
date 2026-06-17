import { describe, expect, it } from 'vitest'
import { generateBOM } from './bom.ts'

describe('BOM export', () => {
  it('generates CSV header', () => {
    const csv = generateBOM([], () => '')
    expect(csv).toBe('Reference,Type,Value,Footprint,Quantity')
  })

  it('includes placed components', () => {
    const csv = generateBOM(
      [
        {
          componentId: 'r1',
          reference: 'R1',
          type: 'resistor',
          footprintName: 'axial-resistor',
          position: { x: 0, y: 0 },
          rotation: 0,
          side: 'top',
          locked: false,
        },
      ],
      () => '1k',
    )
    expect(csv).toContain('R1')
    expect(csv).toContain('axial-resistor')
    expect(csv).toContain('1k')
    expect(csv).toContain('resistor')
  })

  it('groups identical components by quantity', () => {
    const csv = generateBOM(
      [
        {
          componentId: 'r1',
          reference: 'R1',
          type: 'resistor',
          footprintName: 'axial-resistor',
          position: { x: 0, y: 0 },
          rotation: 0,
          side: 'top',
          locked: false,
        },
        {
          componentId: 'r2',
          reference: 'R2',
          type: 'resistor',
          footprintName: 'axial-resistor',
          position: { x: 10, y: 0 },
          rotation: 0,
          side: 'top',
          locked: false,
        },
      ],
      () => '1k',
    )
    expect(csv).toContain('R1, R2')
    expect(csv).toContain(',2')
  })

  it('separates different footprints', () => {
    const csv = generateBOM(
      [
        {
          componentId: 'r1',
          reference: 'R1',
          type: 'resistor',
          footprintName: 'axial-resistor',
          position: { x: 0, y: 0 },
          rotation: 0,
          side: 'top',
          locked: false,
        },
        {
          componentId: 'c1',
          reference: 'C1',
          type: 'capacitor',
          footprintName: '0805',
          position: { x: 10, y: 0 },
          rotation: 0,
          side: 'top',
          locked: false,
        },
      ],
      () => '',
    )
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
  })

  it('escapes commas in references', () => {
    const csv = generateBOM(
      [
        {
          componentId: 'r1',
          reference: 'R1',
          type: 'resistor',
          footprintName: 'axial-resistor',
          position: { x: 0, y: 0 },
          rotation: 0,
          side: 'top',
          locked: false,
        },
        {
          componentId: 'r2',
          reference: 'R2',
          type: 'resistor',
          footprintName: 'axial-resistor',
          position: { x: 10, y: 0 },
          rotation: 0,
          side: 'top',
          locked: false,
        },
      ],
      () => '1k',
    )
    expect(csv).toContain('"R1, R2"')
  })
})
