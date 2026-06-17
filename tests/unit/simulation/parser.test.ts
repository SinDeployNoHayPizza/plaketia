import { parseSimulationOutput } from '@/features/simulation/results/parser.ts'
import { describe, expect, it } from 'vitest'

describe('parseSimulationOutput', () => {
  it('parses DC operating point node voltages', () => {
    const stdout = [
      '===NODE_VOLTAGES===',
      'v(n001) = 5.000000e+00',
      'v(n002) = 2.500000e+00',
      '===BRANCH_CURRENTS===',
      'i(v1) = -2.500000e-03',
      'i(r1) = 2.500000e-03',
    ].join('\n')

    const result = parseSimulationOutput({ stdout, success: true }, 'op')

    expect(result.success).toBe(true)
    expect(result.nodeVoltages.get('n001')).toBe(5)
    expect(result.nodeVoltages.get('n002')).toBe(2.5)
    expect(result.branchCurrents.get('v1')).toBe(-0.0025)
    expect(result.branchCurrents.get('r1')).toBe(0.0025)
  })

  it('returns empty maps when no voltage section', () => {
    const stdout = ['some output', 'v(n001) = 3.3'].join('\n')

    const result = parseSimulationOutput({ stdout, success: true }, 'op')

    expect(result.nodeVoltages.size).toBe(0)
    expect(result.branchCurrents.size).toBe(0)
  })

  it('reports failure status from output', () => {
    const stdout = ''
    const result = parseSimulationOutput({ stdout, success: false }, 'op')
    expect(result.success).toBe(false)
  })

  it('includes extra messages', () => {
    const stdout = [
      'Doing analysis at TEMP = 27.000000 and TNOM = 27.000000',
      '===NODE_VOLTAGES===',
    ].join('\n')

    const result = parseSimulationOutput({ stdout, success: true }, 'op')

    expect(result.messages.length).toBeGreaterThan(0)
    expect(result.messages[0]).toContain('Doing analysis')
  })
})
