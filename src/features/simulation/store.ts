import { create } from 'zustand'
import type { SimulationResult, SimulationStatus } from './types.ts'

export interface SimulationState {
  status: SimulationStatus
  result: SimulationResult | null
  error: string | null

  setStatus: (status: SimulationStatus) => void
  setResult: (result: SimulationResult | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  status: 'idle',
  result: null,
  error: null,

  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error, status: 'error' }),
  reset: () => set({ status: 'idle', result: null, error: null }),
}))
