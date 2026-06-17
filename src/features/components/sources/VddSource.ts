import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class VddSource extends ComponentBase {
  readonly type = 'vdd'

  get pins(): Pin[] {
    return [
      { index: 0, name: 'VDD', electricalType: 'power' },
      { index: 1, name: 'GND', electricalType: 'ground' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'V',
      pins: ['', ''],
      value: this.value || '5V',
    }
  }

  validate(): ValidationResult {
    const errors: string[] = []
    if (!this.value) {
      errors.push('VDD value is required')
    }
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  clone(): VddSource {
    return new VddSource(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): VddSource {
    refCounter++
    return new VddSource(id, reference ?? `VDD${refCounter}`, {
      value: '5V',
      position: { x: 0, y: 0 },
    })
  }
}
