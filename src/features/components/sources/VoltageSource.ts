import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class VoltageSource extends ComponentBase {
  readonly type = 'voltage-source'

  get pins(): Pin[] {
    return [
      { index: 0, name: '+', electricalType: 'passive' },
      { index: 1, name: '-', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'V',
      pins: ['%node+%', '%node-%'],
      value: this.value || '5V',
    }
  }

  validate(): ValidationResult {
    const errors: string[] = []
    if (!this.value) {
      errors.push('Voltage source value is required')
    }
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  clone(): VoltageSource {
    return new VoltageSource(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): VoltageSource {
    refCounter++
    return new VoltageSource(id, reference ?? `V${refCounter}`, {
      value: '5V',
      position: { x: 0, y: 0 },
    })
  }
}
