import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class Capacitor extends ComponentBase {
  readonly type = 'capacitor'

  get pins(): Pin[] {
    return [
      { index: 0, name: '+', electricalType: 'passive' },
      { index: 1, name: '-', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'C',
      pins: ['%node1%', '%node2%'],
      value: this.value || '100nF',
    }
  }

  validate(): ValidationResult {
    const errors: string[] = []
    if (!this.value) {
      errors.push('Capacitor value is required')
    }
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  clone(): Capacitor {
    return new Capacitor(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): Capacitor {
    refCounter++
    return new Capacitor(id, reference ?? `C${refCounter}`, {
      value: '100nF',
      position: { x: 0, y: 0 },
    })
  }
}
