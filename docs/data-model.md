# Data Model

## Circuit Model

The circuit is represented as a graph of nodes connected by components.

```typescript
interface Circuit {
  id: string
  name: string
  description: string
  nodes: Map<string, CircuitNode>
  components: Component[]
  metadata: CircuitMetadata
}

interface CircuitNode {
  id: string              // e.g. "N001", "VCC", "GND"
  label: string
  type: 'signal' | 'power' | 'ground'
  position?: { x: number; y: number }  // schematic position
}

interface CircuitMetadata {
  created: string         // ISO date
  modified: string
  schematicScale: number
  gridSize: number
}
```

## Component Model

Every component implements the `Component` interface:

```typescript
interface Component {
  id: string
  type: string            // "resistor", "capacitor", "bjt", etc.
  reference: string       // e.g. "R1", "Q2"
  value: string           // e.g. "10k", "100nF"
  model?: string          // SPICE model name
  pins: Pin[]
  position: { x: number; y: number }
  rotation: number        // degrees
  metadata: Record<string, unknown>

  // Methods
  toSpiceNetlist(): string
  getSchematicSymbol(): SchematicSymbol
  getFootprint(): Footprint
  get3DModel(): ThreeDModel
  validate(): ValidationResult
}

interface Pin {
  index: number
  name: string            // "1", "2", "collector", "base", etc.
  nodeId: string | null   // connected node
  electricalType: 'passive' | 'input' | 'output' | 'power' | 'ground'
}
```

### Component Type Hierarchy

```
Component (abstract interface)
├── PassiveComponent
│   ├── Resistor     → R, value (Ω), tolerance, power rating
│   ├── Capacitor    → C, value (F), voltage rating, dielectric
│   └── Inductor     → L, value (H), current rating, core type
├── ActiveComponent
│   ├── Diode        → D, SPICE model (1N4148, 1N4007...)
│   ├── BJT          → Q, type (NPN/PNP), SPICE model
│   ├── MOSFET       → M, type (N/P-channel), SPICE model
│   └── OpAmp        → U, model (ideal, LM741, TL072...)
├── SourceComponent
│   ├── VoltageSource  → V, DC/SINE/PULSE/PWL
│   └── CurrentSource  → I, DC/SINE/PULSE
├── InstrumentComponent
│   ├── Voltmeter    → measures voltage between two nodes
│   ├── Ammeter      → measures current through a branch
│   ├── Ohmmeter     → measures resistance
│   └── Oscilloscope → displays waveforms
└── ICComponent (future)
    ├── DigitalGate  → AND, OR, NAND, NOR, XOR, NOT
    ├── FlipFlop     → D, JK, T
    └── CustomIC     → user-defined subcircuit
```

## PCB Model

```typescript
interface PCBBoard {
  width: number           // mm
  height: number          // mm
  thickness: number       // mm (default 1.6)
  material: 'FR4' | 'CEM1'
  copperWeight: number    // oz (default 1)
  layers: PCBLayer[]
  placedComponents: PlacedComponent[]
  tracks: Track[]
  pads: Pad[]
  vias: Via[]
  boardOutline: Point[]
  metadata: PCBMetadata
}

interface PCBLayer {
  name: string            // "top", "bottom", "solderMaskTop", "silkscreenTop"
  type: 'copper' | 'solderMask' | 'silkscreen' | 'substrate'
  visible: boolean
}

interface PlacedComponent {
  componentId: string
  footprint: Footprint
  position: { x: number; y: number }   // mm
  rotation: number                      // degrees
  side: 'top' | 'bottom'
}

interface Track {
  id: string
  layer: 'top' | 'bottom'
  points: Point[]
  width: number           // mm
  netId: string
}

interface Pad {
  id: string
  position: Point
  size: { width: number; height: number }
  shape: 'round' | 'rect' | 'oval'
  holeDiameter?: number   // for THT
  layer: 'top' | 'bottom'
  netId: string
}

interface Footprint {
  name: string
  description: string
  pads: Pad[]
  outline?: Point[]
  height?: number         // mm, for 3D
}

interface Point {
  x: number
  y: number
}
```

## Connection Model

Connections define the netlist (how components are wired together).

```typescript
interface Connection {
  id: string
  nodeId: string
  componentId: string
  pinIndex: number
}
```

## SPICE Netlist Format

Plaketia uses standard SPICE netlist format for simulation I/O:

```spice
* Circuit: My Amplifier
R1 N001 N002 10k
R2 N002 N003 2.2k
C1 N001 N004 100nF
Q1 N003 N002 GND N002 2N2222
V1 N001 GND DC 12
.tran 0.1m 10m
.plot tran V(N003)
.end
```

## Project File (.plaketia)

Serialized as JSON with embedded netlist:

```json
{
  "format": "plaketia",
  "version": 1,
  "circuit": { ... },
  "pcb": { ... },
  "schematic": {
    "viewport": { "x": 0, "y": 0, "zoom": 1 },
    "nodes": [ ... ],
    "edges": [ ... ]
  },
  "simulation": {
    "analyses": [ ... ],
    "instruments": [ ... ]
  }
}
```
