export type AnalysisType = 'op' | 'tran' | 'dc'

export interface SimulationConfig {
  analysis: AnalysisType
  params: {
    stopTime?: number
    maxStep?: number
    sourceName?: string
    startValue?: number
    stopValue?: number
    stepValue?: number
  }
}

export interface WaveformPoint {
  time: number
  value: number
}

export interface Waveform {
  label: string
  unit: string
  data: WaveformPoint[]
}

export interface SimulationResult {
  type: AnalysisType
  success: boolean
  messages: string[]
  nodeVoltages: Map<string, number>
  branchCurrents: Map<string, number>
  waveforms: Waveform[]
}

export type SimulationStatus = 'idle' | 'loading-wasm' | 'ready' | 'running' | 'completed' | 'error'
