import { useCircuitStore } from '@/features/circuit/store.ts'
import { useCallback, useState } from 'react'
import { useSimulation } from './hooks/useSimulation.ts'
import { OscilloscopePanel } from './results/OscilloscopePanel.tsx'
import type { AnalysisType, SimulationConfig } from './types.ts'

export function SimulationPanel() {
  const { status, result, error, init, run } = useSimulation()
  const [analysis, setAnalysis] = useState<AnalysisType>('op')
  const [stopTime, setStopTime] = useState('10m')
  const [maxStep, setMaxStep] = useState('100u')

  const handleInit = useCallback(async () => {
    await init()
  }, [init])

  const handleRun = useCallback(async () => {
    const state = useCircuitStore.getState()
    const circuit = state.circuit
    if (!circuit) return

    const config: SimulationConfig = {
      analysis,
      params: {},
    }

    if (analysis === 'tran') {
      config.params.stopTime = parseTimeValue(stopTime)
      config.params.maxStep = parseTimeValue(maxStep)
    }

    await run(circuit, state.components, config)
  }, [analysis, stopTime, maxStep, run])

  return (
    <div className="flex flex-col">
      <div className="px-3 py-2 border-b border-trace flex items-center justify-between">
        <span className="font-body text-xs font-medium text-text-secondary">Simulation</span>
        <div className="flex gap-1">
          {status === 'idle' && (
            <button
              type="button"
              onClick={handleInit}
              className="font-body text-xs text-copper hover:text-copper-dark font-medium transition-colors"
            >
              Load WASM
            </button>
          )}
          {status === 'ready' && (
            <button
              type="button"
              onClick={handleRun}
              className="font-body text-xs text-copper hover:text-copper-dark font-medium transition-colors"
            >
              Run
            </button>
          )}
        </div>
      </div>

      <div className="px-3 py-2 space-y-2">
        <div>
          <label
            htmlFor="sim-analysis"
            className="font-body text-[10px] text-text-secondary block mb-0.5"
          >
            Analysis
          </label>
          <select
            id="sim-analysis"
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value as AnalysisType)}
            className="w-full font-body text-xs bg-surface border border-trace rounded px-1.5 py-1 text-text-primary outline-none focus:border-copper"
          >
            <option value="op">DC Op Point</option>
            <option value="tran">Transient</option>
            <option value="dc">DC Sweep</option>
          </select>
        </div>

        {analysis === 'tran' && (
          <>
            <div>
              <label
                htmlFor="sim-stop"
                className="font-body text-[10px] text-text-secondary block mb-0.5"
              >
                Stop Time
              </label>
              <input
                id="sim-stop"
                type="text"
                value={stopTime}
                onChange={(e) => setStopTime(e.target.value)}
                className="w-full font-body text-xs bg-surface border border-trace rounded px-1.5 py-1 text-text-primary outline-none focus:border-copper"
              />
            </div>
            <div>
              <label
                htmlFor="sim-step"
                className="font-body text-[10px] text-text-secondary block mb-0.5"
              >
                Max Step
              </label>
              <input
                id="sim-step"
                type="text"
                value={maxStep}
                onChange={(e) => setMaxStep(e.target.value)}
                className="w-full font-body text-xs bg-surface border border-trace rounded px-1.5 py-1 text-text-primary outline-none focus:border-copper"
              />
            </div>
          </>
        )}

        {status === 'loading-wasm' && (
          <div className="font-body text-[10px] text-text-secondary animate-pulse">
            Loading ngspice WASM...
          </div>
        )}

        {status === 'running' && (
          <div className="font-body text-[10px] text-text-secondary animate-pulse">
            Running simulation...
          </div>
        )}

        {error && (
          <div className="font-mono text-[10px] text-red-600 leading-tight whitespace-pre-wrap">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="px-3 py-2 space-y-3 max-h-80 overflow-y-auto border-t border-trace">
          {result.nodeVoltages.size > 0 && (
            <div>
              <div className="font-body text-[10px] font-medium text-text-secondary mb-1">
                Node Voltages
              </div>
              <table className="w-full font-mono text-[10px]">
                <tbody>
                  {[...result.nodeVoltages.entries()].map(([node, v]) => (
                    <tr key={node}>
                      <td className="text-text-secondary pr-2">{node}</td>
                      <td className="text-text-primary text-right">{v.toFixed(4)} V</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.branchCurrents.size > 0 && (
            <div>
              <div className="font-body text-[10px] font-medium text-text-secondary mb-1">
                Branch Currents
              </div>
              <table className="w-full font-mono text-[10px]">
                <tbody>
                  {[...result.branchCurrents.entries()].map(([branch, i]) => (
                    <tr key={branch}>
                      <td className="text-text-secondary pr-2">{branch}</td>
                      <td className="text-text-primary text-right">{formatCurrent(i)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.waveforms.length > 0 && (
            <div>
              <div className="font-body text-[10px] font-medium text-text-secondary mb-1">
                Waveforms
              </div>
              <OscilloscopePanel result={result} />
            </div>
          )}

          {result.messages.length > 0 && (
            <div>
              <div className="font-body text-[10px] font-medium text-text-secondary mb-1">
                Messages
              </div>
              <div className="font-mono text-[9px] text-text-secondary max-h-20 overflow-y-auto leading-tight">
                {result.messages.slice(0, 10).map((msg) => (
                  <div key={msg}>{msg}</div>
                ))}
                {result.messages.length > 10 && (
                  <div className="text-text-secondary">...{result.messages.length - 10} more</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!result &&
        status !== 'idle' &&
        status !== 'running' &&
        status !== 'loading-wasm' &&
        !error && (
          <div className="px-3 py-4 text-center font-body text-xs text-text-secondary border-t border-trace">
            {status === 'ready' ? 'Configure and run a simulation' : 'Load the WASM engine first'}
          </div>
        )}
    </div>
  )
}

function parseTimeValue(value: string): number {
  const match = value.match(/^([\d.]+)\s*([munp]?)/i)
  if (!match) return Number.parseFloat(value) || 0
  const num = Number.parseFloat(match[1])
  const suffix = match[2].toLowerCase()
  const multipliers: Record<string, number> = {
    m: 1e-3,
    u: 1e-6,
    n: 1e-9,
    p: 1e-12,
  }
  return num * (multipliers[suffix] ?? 1)
}

function formatCurrent(amps: number): string {
  const abs = Math.abs(amps)
  if (abs >= 1) return `${amps.toFixed(3)} A`
  if (abs >= 1e-3) return `${(amps * 1e3).toFixed(3)} mA`
  if (abs >= 1e-6) return `${(amps * 1e6).toFixed(3)} μA`
  return `${(amps * 1e9).toFixed(3)} nA`
}
