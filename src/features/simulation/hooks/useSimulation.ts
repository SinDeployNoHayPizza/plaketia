import type { Circuit } from '@/features/circuit/model/Circuit.ts'
import type { Component } from '@/features/components/base/types.ts'
import { useCallback, useRef } from 'react'
import { formatSimulationError } from '../engine/errors.ts'
import { generateSimulationNetlist } from '../engine/netlist.ts'
import { NgspiceEngine } from '../engine/ngspice.ts'
import { parseSimulationOutput } from '../results/parser.ts'
import { useSimulationStore } from '../store.ts'
import type { SimulationConfig, SimulationResult } from '../types.ts'

export function useSimulation() {
  const engineRef = useRef<NgspiceEngine | null>(null)
  const store = useSimulationStore()

  const init = useCallback(async () => {
    if (engineRef.current?.isLoaded()) return

    store.setStatus('loading-wasm')
    try {
      const engine = new NgspiceEngine()
      await engine.load()
      engineRef.current = engine
      store.setStatus('ready')
    } catch (e) {
      store.setError(e instanceof Error ? e.message : 'Failed to load ngspice')
    }
  }, [store])

  const run = useCallback(
    async (
      circuit: Circuit,
      components: Map<string, Component>,
      config: SimulationConfig,
    ): Promise<SimulationResult | null> => {
      if (!engineRef.current?.isLoaded()) {
        store.setError('ngspice not loaded. Call init() first.')
        return null
      }

      store.setStatus('running')
      store.setResult(null)
      store.setError(null)

      try {
        const netlist = generateSimulationNetlist(circuit, components, config)
        const output = await engineRef.current.runNetlist(netlist)
        const result = parseSimulationOutput(output, config.analysis)
        store.setResult(result)
        store.setStatus(result.success ? 'completed' : 'error')
        if (!result.success) {
          store.setError(formatSimulationError(output.stdout, output.stderr, result.messages))
        }
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Simulation error'
        store.setError(msg)
        return null
      }
    },
    [store],
  )

  const reset = useCallback(() => {
    store.reset()
  }, [store])

  return {
    status: store.status,
    result: store.result,
    error: store.error,
    init,
    run,
    reset,
  }
}
