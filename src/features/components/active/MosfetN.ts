import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class MosfetN extends ComponentBase {
  readonly type = 'mosfet-n'

  get pins(): Pin[] {
    return [
      { index: 0, name: 'D', electricalType: 'passive' },
      { index: 1, name: 'G', electricalType: 'input' },
      { index: 2, name: 'S', electricalType: 'passive' },
      { index: 3, name: 'B', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'M',
      pins: ['%D%', '%G%', '%S%', '%B%'],
      modelName: this.model || 'NMOS',
    }
  }

  validate(): ValidationResult {
    return { valid: true, errors: [], warnings: [] }
  }

  clone(): MosfetN {
    return new MosfetN(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): MosfetN {
    refCounter++
    return new MosfetN(id, reference ?? `M${refCounter}`, {
      model: 'NMOS',
      position: { x: 0, y: 0 },
    })
  }
}
