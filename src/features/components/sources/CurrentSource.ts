import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class CurrentSource extends ComponentBase {
  readonly type = 'current-source'

  get pins(): Pin[] {
    return [
      { index: 0, name: '+', electricalType: 'passive' },
      { index: 1, name: '-', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'I',
      pins: ['%node+%', '%node-%'],
      value: this.value || '1mA',
    }
  }

  validate(): ValidationResult {
    const errors: string[] = []
    if (!this.value) {
      errors.push('Current source value is required')
    }
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  clone(): CurrentSource {
    return new CurrentSource(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): CurrentSource {
    refCounter++
    return new CurrentSource(id, reference ?? `I${refCounter}`, {
      value: '1mA',
      position: { x: 0, y: 0 },
    })
  }
}
