import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class Voltmeter extends ComponentBase {
  readonly type = 'voltmeter'

  get pins(): Pin[] {
    return [
      { index: 0, name: '+', electricalType: 'input' },
      { index: 1, name: '-', electricalType: 'input' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return { prefix: '*', pins: [], value: `voltmeter ${this.reference}` }
  }

  validate(): ValidationResult {
    return { valid: true, errors: [], warnings: [] }
  }

  clone(): Voltmeter {
    return new Voltmeter(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): Voltmeter {
    refCounter++
    return new Voltmeter(id, reference ?? `VM${refCounter}`, {
      value: '0V',
      position: { x: 0, y: 0 },
    })
  }
}
