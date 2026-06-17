# Changelog

## v0.1.0 (2026-06-16)

### Features
- **Circuit Model**: core graph with `Circuit`, `CircuitNode`, `Connection`
- **Components**: base abstraction + Resistor, Capacitor, Inductor
- **SPICE Netlist**: generate netlists from circuit graph
- **Schematic Editor**: full schematic capture with @xyflow/react
  - Component palette with drag-and-drop placement
  - Bezier-curved wire routing
  - Properties panel (value/reference editing)
  - Ground node support
- **Project Manager**: create, open, delete designs (localStorage)
- **Design System**: Tailwind CSS v4 with PCB-themed tokens
  - Colors: substrate, silk, copper, mask, trace, gold
  - Typography: Syne, DM Sans, JetBrains Mono
- **UI Components**: Button, Dialog with theme support

### Build
- Vite 8 + React 19 + TypeScript 5
- Biome for lint/format
- Vitest with 35 unit tests passing
- TypeScript strict mode

### Tag: `v0.1.0`
