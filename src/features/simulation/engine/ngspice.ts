import createNgspiceModule from '@o.z/ngspice-wasm'
import type { NgspiceModule } from '@o.z/ngspice-wasm'

export interface SimulationOutput {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number | null
}

export class NgspiceEngine {
  private module: NgspiceModule | null = null
  private stdout: string[] = []
  private stderr: string[] = []

  async load(): Promise<void> {
    if (this.module) return

    this.stdout = []
    this.stderr = []

    this.module = await createNgspiceModule({
      print: (text: string) => this.stdout.push(text),
      printErr: (text: string) => this.stderr.push(text),
    })
  }

  isLoaded(): boolean {
    return this.module !== null
  }

  async runNetlist(netlist: string): Promise<SimulationOutput> {
    const mod = this.module
    if (!mod) throw new Error('ngspice not loaded')

    this.stdout = []
    this.stderr = []

    const filename = '/plaketia.cir'
    mod.FS.writeFile(filename, netlist)

    const args = ['ngspice', '-b', filename]
    const argv = mod._malloc(args.length * 4)

    for (let i = 0; i < args.length; i++) {
      const strPtr = mod._malloc(args[i].length + 1)
      mod.stringToUTF8(args[i], strPtr, args[i].length + 1)
      mod.setValue(argv + i * 4, strPtr, 'i32')
    }

    let exitCode: number | null = null

    try {
      exitCode = mod._main(args.length, argv) as number
    } catch {
      exitCode = -1
    }

    return {
      success: exitCode === 0,
      stdout: this.stdout.join('\n'),
      stderr: this.stderr.join('\n'),
      exitCode,
    }
  }
}
