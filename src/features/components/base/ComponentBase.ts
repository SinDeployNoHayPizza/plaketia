import type { Component, Pin, SpiceDeviceLine, ValidationResult } from './types.ts'

export abstract class ComponentBase implements Component {
  readonly id: string
  abstract readonly type: string
  readonly reference: string
  value: string
  model: string | undefined
  abstract readonly pins: Pin[]
  position: { x: number; y: number }
  rotation: number
  metadata: Record<string, unknown>

  constructor(
    id: string,
    reference: string,
    params: {
      value?: string
      model?: string
      position?: { x: number; y: number }
      rotation?: number
      metadata?: Record<string, unknown>
    } = {},
  ) {
    this.id = id
    this.reference = reference
    this.value = params.value ?? ''
    this.model = params.model
    this.position = params.position ?? { x: 0, y: 0 }
    this.rotation = params.rotation ?? 0
    this.metadata = params.metadata ?? {}
  }

  abstract toSpiceDeviceLine(): SpiceDeviceLine

  toSpiceNetlist(): string {
    const line = this.toSpiceDeviceLine()
    const ref = this.reference.startsWith(line.prefix)
      ? this.reference
      : line.prefix + this.reference
    const parts: string[] = [ref]

    for (const pin of line.pins) {
      parts.push(pin)
    }

    if (line.modelName) {
      parts.push(line.modelName)
    } else if (line.value) {
      parts.push(line.value)
    }

    if (line.params) {
      for (const [key, val] of Object.entries(line.params)) {
        parts.push(`${key}=${val}`)
      }
    }

    return parts.join(' ')
  }

  abstract validate(): ValidationResult

  abstract clone(): Component

  protected defaultPass(): ValidationResult {
    return { valid: true, errors: [], warnings: [] }
  }
}
