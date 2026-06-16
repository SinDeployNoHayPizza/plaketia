# Components Catalog

## Electronic Components

### Passive Components

| Component | Symbol | SPICE Prefix | Parameters | Footprint Examples |
|-----------|--------|-------------|------------|-------------------|
| Resistor | Rectangle | R | value (Ω), tolerance, power | 0805, 1206, axial |
| Capacitor | Parallel lines | C | value (F), voltage, dielectric | 0805, radial, ceramic |
| Inductor | Loops | L | value (H), current, core type | 0805, radial, toroidal |
| Potentiometer | Resistor + arrow | R | value, wiper position | 3296W, RM-065 |

### Active Components

| Component | Symbol | SPICE Prefix | Models Included | Footprint |
|-----------|--------|-------------|-----------------|-----------|
| Diode | Triangle + bar | D | 1N4148, 1N4007, 1N5817, Zener 1N4733 | SOD-123, DO-41 |
| BJT NPN | Triangle + line | Q | 2N2222, BC547, 2N3055 | TO-92, TO-220 |
| BJT PNP | Triangle + line | Q | 2N3906, BC557 | TO-92, TO-220 |
| MOSFET N-CH | Vertical bars | M | 2N7000, IRF540 | TO-92, TO-220 |
| MOSFET P-CH | Vertical bars | M | IRF9540, FQP27P06 | TO-220 |
| OpAmp | Triangle | U | Ideal, LM741, LM358, TL072, LM324 | DIP-8, SOIC-8 |

### Sources

| Component | SPICE Prefix | Types | Parameters |
|-----------|-------------|-------|------------|
| Voltage Source | V | DC, SINE, PULSE, PWL | DC value, amplitude, frequency, pulse params |
| Current Source | I | DC, SINE, PULSE | DC value, amplitude, frequency |
| Function Generator | - (virtual instrument) | Sine, Square, Triangle, PWM | Amplitude, offset, frequency, duty cycle |

### Instruments (Virtual)

| Component | Function | Electrical Effect |
|-----------|----------|-------------------|
| Voltmeter | Measures voltage between two nodes | Ideal (infinite impedance) |
| Ammeter | Measures current through a branch | Ideal (zero impedance) |
| Ohmmeter | Measures resistance | Injects small test current |
| Oscilloscope | Displays waveforms | Multiple channels, timebase, trigger |

## UI Components (shared/ui)

| Component | Purpose | Props |
|-----------|---------|-------|
| `Button` | Action trigger | variant, size, disabled, onClick |
| `Toolbar` | Vertical/horizontal action bar | items: ToolbarItem[] |
| `SidePanel` | Collapsible side panel | side, width, collapsed, children |
| `PropertiesPanel` | Edit component properties | component, onChange |
| `Dialog` | Modal dialog | title, open, onClose, children |
| `Canvas` | Wrapper for React Flow / Three.js | children |
| `Grid` | Configurable background grid | size, color, visibility |
| `NumberInput` | Numeric input with units | value, unit, onChange |
| `Select` | Dropdown selector | options, value, onChange |
| `IconButton` | Icon-only button | icon, tooltip, onClick |
| `ToggleButton` | On/off toggle | checked, onChange, label |
| `Slider` | Slider control | min, max, value, onChange |
| `WaveformPlot` | Plotly-based waveform display | traces, layout, onCursor |
| `ContextMenu` | Right-click menu | items, position, onClose |
| `StatusBar` | Bottom status bar | message, items |

## Component Registration

New component types are registered via the component registry:

```typescript
interface ComponentRegistration {
  type: string
  label: string
  category: 'passive' | 'active' | 'source' | 'instrument' | 'ic' | 'custom'
  symbol: React.ComponentType<SchematicSymbolProps>
  model: ComponentModel
  defaultParams: Record<string, unknown>
}

// Registry
const componentRegistry = new Map<string, ComponentRegistration>()

function registerComponent(reg: ComponentRegistration): void {
  componentRegistry.set(reg.type, reg)
}
```

This allows future ICs and digital components to be added as plugins.
