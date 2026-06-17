# Plaketia

Browser-based analog electronics design and analysis tool (EDA). Schematic capture, SPICE simulation, single-sided PCB layout, and 3D visualization — all in the browser, no installation required.

## Features

- **Schematic Editor** — Drag-and-drop components, draw wires, edit properties. Supports passive components (resistors, capacitors, inductors), active components (MOSFETs, BJTs, JFETs, op-amps), and instruments (voltmeter, ammeter, function generator).
- **SPICE Simulation** — Run DC operating point and transient analysis via ngspice-wasm directly in the browser.
- **PCB Layout** — 2D board editor with component placement, manual trace routing (click-to-route, vias, snap-to-grid), design rule checking, netlist highlighting (rat's nest).
- **Export** — Gerber RS-274X (top/bottom copper, silkscreen, outline, drill) and BOM (CSV).
- **3D Board Viewer** — Interactive Three.js visualization of the PCB.

## Stack

Bun · React 19 · TypeScript · Vite 6 · Zustand · @xyflow/react (React Flow) · Three.js / R3F · ngspice-wasm · Plotly.js · Tailwind CSS 4 · Vitest · Playwright · Biome

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.2+

### Clone and run

```bash
git clone https://github.com/SinDeployNoHayPizza/plaketia.git
cd plaketia
bun install
bun run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
bun run build
```

Output goes to `dist/`.

## Running Tests

```bash
bun run test        # Run all tests
bun run test:coverage  # With coverage report
bun run typecheck   # TypeScript type checking
bun run lint        # Biome lint + format
```

## Project Structure

```
src/
├── features/
│   ├── circuit/          # Core circuit model (pure TS, no React)
│   ├── components/       # Component definitions (resistor, mosfet, etc.)
│   ├── schematic/        # React Flow-based schematic editor
│   ├── simulation/       # ngspice-wasm wrapper, netlist generation
│   ├── pcb/              # PCB layout (board model, canvas, export)
│   ├── pcb3d/            # Three.js 3D board viewer
│   └── project/          # File save/load
├── screens/              # Top-level screen components
└── shared/               # Shared UI components
```

## License

MIT
