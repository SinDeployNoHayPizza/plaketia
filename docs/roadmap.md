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

## Phase 1 — Foundation ✅

**Goal**: Scaffold the project, implement core data model, basic UI shell.

- [x] `bun create vite` with React 19 + TypeScript
- [x] Configure Biome, Vitest, Tailwind CSS 4
- [x] Set up GitHub repo with GitHub Flow
- [x] Implement `Circuit`, `CircuitNode`, `Connection` models
- [x] Implement abstract `Component` base class
- [x] Implement passive components: Resistor, Capacitor, Inductor
- [x] SPICE netlist serialization
- [x] Shared UI components: Button, Dialog, SidePanel, Toolbar
- [x] App layout with sidebar + canvas area
- [x] ProjectManager screen (create/open/save projects)
- [x] Unit tests for circuit model and serialization

## Phase 2 — Schematic Editor ✅

**Goal**: Fully functional schematic capture with React Flow.

- [x] Integrate `@xyflow/react`
- [x] Custom nodes for all passive + active components
- [x] Wire drawing (edges between pin handles)
- [x] Drag-and-drop from toolbar to canvas
- [x] Properties panel (edit values, models, references)
- [x] Ground node, power symbols, labels
- [x] ERC validation (Electrical Rule Check)
- [x] Export to SPICE netlist (generateNetlist)
- [x] Import from SPICE netlist (parseNetlist + importNetlist)
- [x] Undo/redo for schematic edits (Ctrl+Z/Y snapshot-based)
- [x] Integration tests: schematic → netlist round-trip
- [x] MOSFET N / JFET N component models + symbols
- [x] SPICE parser extension: M, J, .model, .subckt, line continuation, extended sources

## Phase 3 — Simulation & Instruments ✅

**Goal**: Run SPICE simulations in-browser, display results with virtual instruments.

- [x] Integrate `ngspice-wasm` (lazy loaded)
- [x] `useSimulation()` hook
- [x] DC Operating Point analysis
- [x] Transient analysis
- [x] VoltageSource, CurrentSource components
- [x] Function Generator (sine, square, triangle, PWM)
- [x] Voltmeter and Ammeter instruments
- [x] Oscilloscope with Plotly waveforms
- [x] Simulation panel (configure, run, stop)
- [x] Error handling (convergence, floating nodes)
- [x] Tests: netlist → ngspice → result parsing

## Phase 4 — PCB Layout (Current)

**Goal**: Place components on single-sided PCB, route traces, export Gerber.

- [x] PCBBoard model + Zustand store
- [x] Footprint definitions (THT + SMD)
- [x] PCB canvas (2D SVG with grid, zoom/pan)
- [x] Component placement from netlist
- [x] Manual trace routing (click-to-route, snap-to-grid, orthogonal rubber-band preview, vias)
- [x] DRC (clearance, trace width, annular ring, drill size, board edge)
- [x] Netlist highlighting (rat's nest airwires)
- [x] Gerber RS-274X export (top/bottom copper, silkscreen, outline, drill)
- [x] BOM export (CSV)
- [x] Tests for PCB model, DRC, Gerber, and BOM (28 tests)

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
Phase 3: Simulation     ██████████ (done)
Phase 4: PCB Layout     ██████████ (2 weeks)
Phase 5: 3D Viewer      ██████████ (2 weeks)
Phase 6: Polish         ██████████ (2 weeks)
Phase 7: Future         ══════════ (ongoing)
```

Total MVP timeline: ~12 weeks
