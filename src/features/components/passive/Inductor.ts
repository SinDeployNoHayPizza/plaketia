import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export class Inductor extends ComponentBase {
  readonly type = 'inductor'

  get pins(): Pin[] {
    return [
      { index: 0, name: '1', electricalType: 'passive' },
      { index: 1, name: '2', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    return {
      prefix: 'L',
      pins: ['%node1%', '%node2%'],
      value: this.value || '10mH',
    }
  }

  validate(): ValidationResult {
    const errors: string[] = []
    if (!this.value) {
      errors.push('Inductor value is required')
    }
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  clone(): Inductor {
    return new Inductor(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): Inductor {
    refCounter++
    return new Inductor(id, reference ?? `L${refCounter}`, {
      value: '10mH',
      position: { x: 0, y: 0 },
    })
  }
}
