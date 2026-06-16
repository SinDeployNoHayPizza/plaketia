import { describe, expect, it } from 'vitest'
import { parseNetlist } from '../../src/features/circuit/io/spiceNetlist.ts'

describe('spiceNetlist', () => {
  describe('parseNetlist', () => {
    it('parses a basic netlist', () => {
      const netlist = `
* Voltage Divider
R1 N001 N002 10k
R2 N002 GND 2.2k
V1 N001 GND DC 12
.op
.end
`
      const result = parseNetlist(netlist)
      expect(result.title).toBe('Voltage Divider')
      expect(result.lines).toHaveLength(4)
      expect(result.errors).toHaveLength(0)
    })

    it('handles empty netlist', () => {
      const result = parseNetlist('')
      expect(result.title).toBe('Imported')
      expect(result.lines).toHaveLength(0)
    })

    it('ignores comments', () => {
      const netlist = `
* Title
* Another comment
R1 A B 10k
.end
`
      const result = parseNetlist(netlist)
      expect(result.lines).toHaveLength(1)
    })

    it('stops at .end', () => {
      const netlist = `
R1 A B 10k
.end
R2 C D 20k
`
      const result = parseNetlist(netlist)
      expect(result.lines).toHaveLength(1)
    })

    it('handles analysis directives', () => {
      const netlist = `
R1 A B 10k
.op
.end
`
      const result = parseNetlist(netlist)
      expect(result.lines).toHaveLength(2)
      expect(result.lines[1]).toBe('.op')
    })
  })
})
