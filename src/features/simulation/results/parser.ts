import type { SimulationConfig, SimulationResult, Waveform, WaveformPoint } from '../types.ts'

type ParsePhase = 'header' | 'voltages' | 'currents' | 'transient' | 'dc-sweep'

export function parseSimulationOutput(
  output: { stdout: string; success: boolean },
  type: SimulationConfig['analysis'],
): SimulationResult {
  const messages: string[] = []
  const nodeVoltages = new Map<string, number>()
  const branchCurrents = new Map<string, number>()
  const waveforms: Waveform[] = []
  const lines = output.stdout.split('\n')

  let phase: ParsePhase = 'header'
  let headerLabels: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed === '===NODE_VOLTAGES===') {
      phase = 'voltages'
      continue
    }
    if (trimmed === '===BRANCH_CURRENTS===') {
      phase = 'currents'
      continue
    }
    if (trimmed === '===TRAN_START===') {
      phase = 'transient'
      headerLabels = []
      continue
    }
    if (trimmed === '===TRAN_END===') {
      phase = 'header'
      continue
    }
    if (trimmed === '===DC_SWEEP_START===') {
      phase = 'dc-sweep'
      headerLabels = []
      continue
    }
    if (trimmed === '===DC_SWEEP_END===') {
      phase = 'header'
      continue
    }

    if (phase === 'voltages') {
      const match = trimmed.match(/^v\((\S+)\)\s*=\s*([\d.eE+-]+)/i)
      if (match) {
        nodeVoltages.set(match[1].toLowerCase(), Number.parseFloat(match[2]))
      }
    } else if (phase === 'currents') {
      const match = trimmed.match(/^i\((\S+)\)\s*=\s*([\d.eE+-]+)/i)
      if (match) {
        branchCurrents.set(match[1].toLowerCase(), Number.parseFloat(match[2]))
      }
    } else if (phase === 'transient') {
      if (trimmed.startsWith('Index')) {
        headerLabels = trimmed.split(/\s+/).slice(1)
        continue
      }
      if (headerLabels.length > 0) {
        const parts = trimmed.split(/\s+/)
        if (parts.length >= headerLabels.length + 1) {
          const timeIdx = headerLabels.findIndex((h) => h.toLowerCase() === 'time')
          if (timeIdx < 0) continue
          const time = Number.parseFloat(parts[timeIdx + 1])
          if (Number.isNaN(time)) continue

          for (let i = 0; i < headerLabels.length; i++) {
            if (i === timeIdx) continue
            const label = headerLabels[i]
            const value = Number.parseFloat(parts[i + 1])
            if (Number.isNaN(value)) continue

            let waveform = waveforms.find((w) => w.label === label)
            if (!waveform) {
              waveform = { label, unit: 'V', data: [] }
              waveforms.push(waveform)
            }
            waveform.data.push({ time, value })
          }
        }
      }
    } else if (phase === 'dc-sweep') {
      if (trimmed.startsWith('Index')) {
        headerLabels = trimmed.split(/\s+/).slice(1)
        continue
      }
      if (headerLabels.length > 0) {
        const parts = trimmed.split(/\s+/)
        if (parts.length >= headerLabels.length + 1) {
          const sweepIdx = headerLabels.findIndex((h) => !h.toLowerCase().startsWith('v('))
          const sweepVal =
            sweepIdx >= 0 ? Number.parseFloat(parts[sweepIdx + 1]) : Number.parseFloat(parts[1])
          if (Number.isNaN(sweepVal)) continue

          for (let i = 0; i < headerLabels.length; i++) {
            if (i === sweepIdx) continue
            const label = headerLabels[i]
            const value = Number.parseFloat(parts[i + 1])
            if (Number.isNaN(value) || !label.toLowerCase().startsWith('v(')) continue

            let waveform = waveforms.find((w) => w.label === label)
            if (!waveform) {
              waveform = { label, unit: 'V', data: [] }
              waveforms.push(waveform)
            }
            waveform.data.push({ time: sweepVal, value })
          }
        }
      }
    } else {
      messages.push(trimmed)
    }
  }

  return {
    type,
    success: output.success,
    messages,
    nodeVoltages,
    branchCurrents,
    waveforms,
  }
}
