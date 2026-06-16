# Roadmap

## Phase 0 — Planning & Documentation ✅ (Current)

- [x] Project structure definition
- [x] Architecture documentation
- [x] Data model specification
- [x] Screen definitions
- [x] Component catalog
- [x] Simulation engine design
- [x] 3D PCB model design
- [x] Standards selection
- [x] Testing strategy
- [x] AGENTS.md
- [x] opencode configuration

## Phase 1 — Foundation (Estimated: 2 weeks)

**Goal**: Scaffold the project, implement core data model, basic UI shell.

- [ ] `bun create vite` with React 19 + TypeScript
- [ ] Configure Biome, Vitest, Tailwind CSS 4
- [ ] Set up GitHub repo with GitHub Flow
- [ ] Implement `Circuit`, `CircuitNode`, `Connection` models
- [ ] Implement abstract `Component` base class
- [ ] Implement passive components: Resistor, Capacitor, Inductor
- [ ] SPICE netlist serialization/deserialization
- [ ] Shared UI components: Button, Dialog, SidePanel, Toolbar
- [ ] App layout with sidebar + canvas area
- [ ] ProjectManager screen (create/open/save projects)
- [ ] Unit tests for circuit model and serialization

## Phase 2 — Schematic Editor (Estimated: 2 weeks)

**Goal**: Fully functional schematic capture with React Flow.

- [ ] Integrate `@xyflow/react`
- [ ] Custom nodes for all passive + active components
- [ ] Wire drawing (edges between pin handles)
- [ ] Drag-and-drop from toolbar to canvas
- [ ] Properties panel (edit values, models, references)
- [ ] Ground node, power symbols, labels
- [ ] ERC validation (Electrical Rule Check)
- [ ] Export to SPICE netlist
- [ ] Import from SPICE netlist
- [ ] Undo/redo for schematic edits
- [ ] Integration tests: schematic → netlist

## Phase 3 — Simulation & Instruments (Estimated: 2 weeks)

**Goal**: Run SPICE simulations in-browser, display results with virtual instruments.

- [ ] Integrate `ngspice-wasm` (lazy loaded)
- [ ] `useSimulation()` hook
- [ ] DC Operating Point analysis
- [ ] Transient analysis
- [ ] VoltageSource, CurrentSource components
- [ ] Function Generator (sine, square, triangle, PWM)
- [ ] Voltmeter and Ammeter instruments
- [ ] Oscilloscope with Plotly waveforms
- [ ] Simulation panel (configure, run, stop)
- [ ] Error handling (convergence, floating nodes)
- [ ] Tests: netlist → ngspice → result parsing

## Phase 4 — PCB Layout (Estimated: 2 weeks)

**Goal**: Place components on single-sided PCB, route traces, export Gerber.

- [ ] PCBBoard model with layers
- [ ] Footprint definitions (THT + SMD)
- [ ] PCB canvas (2D top view with grid)
- [ ] Component placement from netlist
- [ ] Manual trace routing
- [ ] DRC (Design Rule Checking)
- [ ] Netlist highlighting
- [ ] Gerber RS-274X export
- [ ] BOM export (CSV)
- [ ] Tests for PCB model and export

## Phase 5 — 3D PCB Viewer (Estimated: 2 weeks)

**Goal**: Interactive 3D visualization of the PCB.

- [ ] Three.js + @react-three/fiber integration
- [ ] Board geometry (FR4 substrate)
- [ ] Copper layer visualization
- [ ] Solder mask and silkscreen
- [ ] Component 3D models (THT: axial, radial, DIP)
- [ ] Component 3D models (SMD: 0805, SOIC, SOT)
- [ ] OrbitControls (rotate, zoom, pan)
- [ ] Click-to-select linking with schematic
- [ ] Layer visibility toggles
- [ ] Performance optimization (instanced meshes)

## Phase 6 — Polish & Extensibility (Estimated: 2 weeks)

**Goal**: Refine UX, add plugin system, optimize performance.

- [ ] Plugin architecture for custom components
- [ ] `ComponentPlugin` interface documentation
- [ ] Dark/light theme
- [ ] Keyboard shortcuts
- [ ] Canvas performance (virtual nodes, lazy rendering)
- [ ] WASM caching for faster subsequent loads
- [ ] Keyboard navigation
- [ ] E2E tests with Playwright
- [ ] User documentation

## Phase 7 — Future (Post-MVP)

- [ ] AC sweep analysis (Bode plots)
- [ ] Digital components (74HC series, flip-flops)
- [ ] Mixed-signal simulation
- [ ] Custom IC subcircuits
- [ ] IPC-2581 export
- [ ] Multi-layer PCB
- [ ] Net-based routing (rat's nest)
- [ ] Autorouter improvements (Lee/Pearcey)
- [ ] Component library manager (import custom models)
- [ ] PWA / offline support
- [ ] Keyboard + mouse gestures

## Timeline Overview

```
Phase 0: Planning       ██████████ (done)
Phase 1: Foundation     ██████████ (2 weeks)
Phase 2: Schematic      ██████████ (2 weeks)
Phase 3: Simulation     ██████████ (2 weeks)
Phase 4: PCB Layout     ██████████ (2 weeks)
Phase 5: 3D Viewer      ██████████ (2 weeks)
Phase 6: Polish         ██████████ (2 weeks)
Phase 7: Future         ══════════ (ongoing)
```

Total MVP timeline: ~12 weeks
