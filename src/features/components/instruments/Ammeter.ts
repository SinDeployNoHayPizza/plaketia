import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class Ammeter extends ComponentBase {
  readonly type = 'ammeter'

  get pins(): Pin[] {
    return [
      { index: 0, name: '+', electricalType: 'input' },
      { index: 1, name: '-', electricalType: 'input' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return { prefix: 'V', pins: ['', ''], value: 'DC 0' }
  }

  validate(): ValidationResult {
    return { valid: true, errors: [], warnings: [] }
  }

  clone(): Ammeter {
    return new Ammeter(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): Ammeter {
    refCounter++
    return new Ammeter(id, reference ?? `AM${refCounter}`, {
      value: '0A',
      position: { x: 0, y: 0 },
    })
  }
}
