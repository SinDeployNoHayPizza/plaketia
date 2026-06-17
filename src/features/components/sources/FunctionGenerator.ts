import { ComponentBase } from '../base/ComponentBase.ts'
import type { Pin, SpiceDeviceLine, ValidationResult } from '../base/types.ts'

let refCounter = 0

export type FuncGenWaveform = 'dc' | 'sine' | 'pulse'

export class FunctionGenerator extends ComponentBase {
  readonly type = 'function-generator'

  get pins(): Pin[] {
    return [
      { index: 0, name: '+', electricalType: 'output' },
      { index: 1, name: '-', electricalType: 'passive' },
    ]
  }

  toSpiceDeviceLine(): SpiceDeviceLine {
    const wf = (this.metadata.waveform as FuncGenWaveform) ?? 'dc'
    const parts: string[] = []

    if (wf === 'sine') {
      const offset = this.metadata.offset ?? '0'
      const amp = this.metadata.amplitude ?? '5'
      const freq = this.metadata.frequency ?? '1k'
      parts.push(`SINE(${offset} ${amp} ${freq})`)
    } else if (wf === 'pulse') {
      const v1 = this.metadata.v1 ?? '0'
      const v2 = this.metadata.v2 ?? '5'
      const delay = this.metadata.delay ?? '0'
      const rise = this.metadata.rise ?? '1u'
      const fall = this.metadata.fall ?? '1u'
      const width = this.metadata.width ?? '0.5m'
      const period = this.metadata.period ?? '1m'
      parts.push(`PULSE(${v1} ${v2} ${delay} ${rise} ${fall} ${width} ${period})`)
    } else {
      parts.push(`DC ${this.value || '5'}`)
    }

    return {
      prefix: 'V',
      pins: ['', ''],
      value: parts.join(' '),
    }
  }

  validate(): ValidationResult {
    return { valid: true, errors: [], warnings: [] }
  }

  clone(): FunctionGenerator {
    return new FunctionGenerator(this.id, this.reference, {
      value: this.value,
      model: this.model,
      position: { ...this.position },
      rotation: this.rotation,
      metadata: { ...this.metadata },
    })
  }

  static create(id: string, reference?: string): FunctionGenerator {
    refCounter++
    return new FunctionGenerator(id, reference ?? `FG${refCounter}`, {
      value: '5V DC',
      position: { x: 0, y: 0 },
      metadata: {
        waveform: 'dc',
        amplitude: '5',
        frequency: '1k',
        offset: '0',
        v1: '0',
        v2: '5',
        delay: '0',
        rise: '1u',
        fall: '1u',
        width: '0.5m',
        period: '1m',
      },
    })
  }
}
