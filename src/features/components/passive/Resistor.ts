import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class Resistor extends ComponentBase {
  readonly type = 'resistor'

  get pins(): Pin[] {
    return [
      { index: 0, name: '1', electricalType: 'passive' },
      { index: 1, name: '2', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'R',
      pins: ['%node1%', '%node2%'],
      value: this.value || '1k',
    }
  }

  validate(): ValidationResult {
    const errors: string[] = []
    if (!this.value) {
      errors.push('Resistor value is required')
    }
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  clone(): Resistor {
    return new Resistor(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): Resistor {
    refCounter++
    return new Resistor(id, reference ?? `R${refCounter}`, {
      value: '1k',
      position: { x: 0, y: 0 },
    })
  }
}
