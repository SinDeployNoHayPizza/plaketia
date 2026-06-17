import { describe, expect, it } from 'vitest'
import { parseSimulationOutput } from './parser.ts'

describe('parseSimulationOutput', () => {
  describe('OP analysis', () => {
    const opStdout = [
      '* Test Circuit',
      '===NODE_VOLTAGES===',
      'v(n001) = 5',
      'v(n002) = 3.3',
      '===BRANCH_CURRENTS===',
      'i(v1) = 0.001',
      'i(r1) = 0.001',
    ].join('\n')

    it('parses node voltages', () => {
      const result = parseSimulationOutput(
        { stdout: opStdout, success: true },
        { analysis: 'op', params: {} },
      )
      expect(result.nodeVoltages.get('n001')).toBe(5)
      expect(result.nodeVoltages.get('n002')).toBe(3.3)
    })

    it('parses branch currents', () => {
      const result = parseSimulationOutput(
        { stdout: opStdout, success: true },
        { analysis: 'op', params: {} },
      )
      expect(result.branchCurrents.get('v1')).toBe(0.001)
      expect(result.branchCurrents.get('r1')).toBe(0.001)
    })

    it('marks success when flag is true', () => {
      const result = parseSimulationOutput(
        { stdout: opStdout, success: true },
        { analysis: 'op', params: {} },
      )
      expect(result.success).toBe(true)
    })

    it('collects unknown lines as messages', () => {
      const output = ['Warning: something odd', '===NODE_VOLTAGES===', 'v(n001) = 5'].join('\n')
      const result = parseSimulationOutput(
        { stdout: output, success: true },
        { analysis: 'op', params: {} },
      )
      expect(result.messages).toContain('Warning: something odd')
    })

    it('returns empty results for empty stdout', () => {
      const result = parseSimulationOutput(
        { stdout: '', success: true },
        { analysis: 'op', params: {} },
      )
      expect(result.nodeVoltages.size).toBe(0)
      expect(result.branchCurrents.size).toBe(0)
      expect(result.waveforms.length).toBe(0)
    })
  })

  describe('TRAN analysis', () => {
    const tranStdout = [
      '===TRAN_START===',
      'Index  time         v(n001)     v(n002)',
      '0      0.000e+00    0.000e+00   5.000e+00',
      '1      1.000e-03    1.234e+00   4.567e+00',
      '2      2.000e-03    2.345e+00   3.210e+00',
      '===TRAN_END===',
    ].join('\n')

    it('parses transient waveforms', () => {
      const result = parseSimulationOutput(
        { stdout: tranStdout, success: true },
        { analysis: 'tran', params: { stopTime: 0.01 } },
      )
      expect(result.waveforms).toHaveLength(2)
    })

    it('extracts label and unit', () => {
      const result = parseSimulationOutput(
        { stdout: tranStdout, success: true },
        { analysis: 'tran', params: { stopTime: 0.01 } },
      )
      const v1 = result.waveforms.find((w) => w.label === 'v(n001)')
      expect(v1).toBeDefined()
      expect(v1!.unit).toBe('V')
    })

    it('extracts waveform data points', () => {
      const result = parseSimulationOutput(
        { stdout: tranStdout, success: true },
        { analysis: 'tran', params: { stopTime: 0.01 } },
      )
      const v1 = result.waveforms.find((w) => w.label === 'v(n001)')
      expect(v1!.data).toHaveLength(3)
      expect(v1!.data[0].time).toBe(0)
      expect(v1!.data[0].value).toBe(0)
      expect(v1!.data[2].time).toBe(0.002)
      expect(v1!.data[2].value).toBe(2.345)
    })
  })

  describe('DC sweep analysis', () => {
    const dcStdout = [
      '===DC_SWEEP_START===',
      'Index  v1          v(n001)     v(n002)',
      '0      0.000e+00   0.000e+00   0.000e+00',
      '1      1.000e+00   9.876e-01   1.234e-01',
      '2      2.000e+00   1.975e+00   2.468e-01',
      '===DC_SWEEP_END===',
    ].join('\n')

    it('parses DC sweep waveforms', () => {
      const result = parseSimulationOutput(
        { stdout: dcStdout, success: true },
        { analysis: 'dc', params: { sourceName: 'V1' } },
      )
      expect(result.waveforms).toHaveLength(2)
    })

    it('uses sweep value as time field', () => {
      const result = parseSimulationOutput(
        { stdout: dcStdout, success: true },
        { analysis: 'dc', params: { sourceName: 'V1' } },
      )
      const v1 = result.waveforms.find((w) => w.label === 'v(n001)')
      expect(v1!.data[0].time).toBe(0)
      expect(v1!.data[0].value).toBe(0)
      expect(v1!.data[2].time).toBe(2)
      expect(v1!.data[2].value).toBe(1.975)
    })
  })
})
