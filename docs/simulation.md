# Simulation Engine

## Overview

Plaketia uses ngspice compiled to WebAssembly for circuit simulation. The simulation engine runs entirely in the browser with no server component.

## Technology

- **ngspice-wasm**: ngspice (stable version) compiled to WebAssembly via Emscripten
- **Lazy loading**: The WASM binary (~5MB) is loaded on first simulation run, not on app start
- **Offline**: After first load, simulation works without network

## Supported Analyses

### DC Operating Point (`.op`)

Computes the steady-state DC voltages and currents.

- **Input**: Circuit netlist with DC sources
- **Output**: Node voltages, branch currents
- **Use case**: Bias point analysis of amplifiers

### DC Sweep (`.dc`)

Varies a source or parameter and computes DC response.

- **Input**: Source name, start/stop values, step size
- **Output**: Table of V/I vs swept parameter
- **Use case**: Transfer characteristic, load line analysis

### Transient Analysis (`.tran`)

Computes time-domain response.

- **Input**: Stop time, maximum step, initial conditions
- **Output**: Waveforms (time vs voltage/current)
- **Use case**: Amplifier response, pulse response, oscillation

### AC Sweep (`.ac`) — Future

Small-signal frequency response.

- **Input**: Frequency range (start, stop), points per decade, type (dec/oct/lin)
- **Output**: Magnitude and phase vs frequency
- **Use case**: Bode plots, filter design

## Pipeline

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│ Circuit │───▶│ Translate│───▶│ ngspice  │───▶│  Parse  │
│  Model  │    │→ netlist │    │  -wasm   │    │ Results │
└─────────┘    └──────────┘    └──────────┘    └────┬────┘
                                                     │
                                          ┌──────────┴──────────┐
                                          │                     │
                                    ┌─────▼─────┐     ┌────────┴────────┐
                                    │ Waveforms  │     │ Instrument      │
                                    │  (Plotly)  │     │  Displays       │
                                    └───────────┘     └─────────────────┘
```

## Engine Architecture

```typescript
interface SimulationConfig {
  analysis: AnalysisType    // 'op' | 'dc' | 'tran' | 'ac'
  params: AnalysisParams    // type-specific parameters
  instruments: Instrument[] // which instruments to read
}

interface AnalysisParams {
  // DC Sweep
  sourceName?: string
  startValue?: number
  stopValue?: number
  stepValue?: number

  // Transient
  stopTime?: number
  maxStep?: number
  initialConditions?: Record<string, number>

  // AC Sweep
  freqStart?: number
  freqStop?: number
  pointsPerDecade?: number
}

interface SimulationResult {
  type: AnalysisType
  success: boolean
  messages: string[]       // SPICE console output
  nodeVoltages: Map<string, number>           // DC op point
  branchCurrents: Map<string, number>         // DC op point
  waveforms: Map<string, WaveformData>        // transient/AC
}

interface WaveformData {
  time: Float64Array       // or frequency for AC
  values: Float64Array     // voltage or current
  label: string            // e.g. "V(N001)"
  unit: string             // "V" or "A"
}
```

## Instrument Integration

Instruments are special components that read simulation results:

```typescript
interface Instrument {
  id: string
  type: 'voltmeter' | 'ammeter' | 'ohmmeter' | 'oscilloscope'
  nodeA: string            // positive probe
  nodeB?: string           // negative probe (GND if omitted)
  componentId?: string     // for ammeter (component to measure current through)
  display: {
    type: 'digital' | 'waveform'
    unit: string
    precision: number
  }
}
```

## Netlist Generation

The circuit model is translated to standard SPICE netlist syntax:

```typescript
function generateNetlist(circuit: Circuit, config: SimulationConfig): string {
  const lines: string[] = []

  // Header
  lines.push(`* ${circuit.name || 'Untitled'}`)

  // Components
  for (const comp of circuit.components) {
    lines.push(comp.toSpiceNetlist())
  }

  // Analysis
  lines.push(generateAnalysisDirective(config))

  // Output
  for (const inst of config.instruments) {
    lines.push(generateOutputDirective(inst, config.analysis))
  }

  lines.push('.end')
  return lines.join('\n')
}
```

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| Convergence failure | Circuit cannot find DC solution | Check biasing, add initial conditions |
| Singular matrix | Floating nodes | Check all nodes have DC path to GND |
| Time step too small | Numerical oscillation | Reduce max step, add damping |
| Model not found | Unknown SPICE model | Check model name spelling |
| WASM load failure | Browser/network issue | Retry, check console |

## Performance

- Target: transient simulation of ~50 components at 60Hz update rate
- Large simulations (>100 nodes) may run slower depending on complexity
- WASM compilation: ~2-5 seconds on first run (then cached)
