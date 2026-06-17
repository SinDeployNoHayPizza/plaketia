import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class JfetN extends ComponentBase {
  readonly type = 'jfet-n'

  get pins(): Pin[] {
    return [
      { index: 0, name: 'D', electricalType: 'passive' },
      { index: 1, name: 'G', electricalType: 'input' },
      { index: 2, name: 'S', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'J',
      pins: ['%D%', '%G%', '%S%'],
      modelName: this.model || 'NJF',
    }
  }

  validate(): ValidationResult {
    return { valid: true, errors: [], warnings: [] }
  }

  clone(): JfetN {
    return new JfetN(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): JfetN {
    refCounter++
    return new JfetN(id, reference ?? `J${refCounter}`, {
      model: 'NJF',
      position: { x: 0, y: 0 },
    })
  }
}
