export interface Pin {
  index: number
  name: string
  electricalType: 'passive' | 'input' | 'output' | 'power' | 'ground'
}

export interface ComponentParams {
  reference: string
  value?: string
  model?: string
  position: { x: number; y: number }
  rotation: number
  metadata: Record<string, unknown>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface SpiceDeviceLine {
  prefix: string
  pins: string[]
  modelName?: string
  value?: string
  params?: Record<string, string>
}

export interface Component {
  readonly id: string
  readonly type: string
  readonly reference: string
  value: string
  model: string | undefined
  pins: Pin[]
  position: { x: number; y: number }
  rotation: number
  metadata: Record<string, unknown>

  toSpiceNetlist(): string
  toSpiceDeviceLine(): SpiceDeviceLine
  validate(): ValidationResult
  clone(): Component
}
