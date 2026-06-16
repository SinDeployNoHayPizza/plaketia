# Architecture

## Overview

Plaketia is a single-user browser-based analog electronics design and analysis application. It runs entirely client-side with no backend server. SPICE simulation is performed in-browser via WebAssembly.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React 19)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │Schematic │ │   PCB    │ │  PCB 3D  │ │Simulation │  │
│  │  Editor  │ │  Layout  │ │  Viewer  │ │   Panel   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│       │            │            │              │        │
├───────┴────────────┴────────────┴──────────────┴────────┤
│               State Management (Zustand)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Circuit │ │ Schematic│ │   PCB    │ │ Simulation │  │
│  │  Store   │ │  Store   │ │  Store   │ │   Store   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
├───────┴────────────┴────────────┴──────────────┴────────┤
│                 Feature / Domain Layer                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Circuit │ │  Comp.   │ │   PCB    │ │Simulation │  │
│  │  Model   │ │ Catalog  │ │  Engine  │ │  Engine   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────┤
│                    External / WASM                         │
│              ┌─────────────────────────┐                  │
│              │     ngspice-wasm         │                  │
│              │  (SPICE simulator in     │                  │
│              │   WebAssembly)           │                  │
│              └─────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. No Backend
All simulation runs client-side via ngspice compiled to WebAssembly. Projects are stored locally using the File System Access API and serialized to `.plaketia` JSON files. No user accounts, no login, no server.

### 2. Unidirectional Data Flow
Zustand stores are the single source of truth. The circuit model is independent of UI concerns. When the user edits the schematic, changes flow: UI event → Zustand action → circuit model → re-render.

### 3. Plugin Architecture for Components
Every electronic component implements a common `Component` interface. This allows third-party components (including future ICs and digital circuits) to be added without modifying core code.

### 4. Schematic ↔ PCB ↔ 3D Synchronization
A common netlist connects schematic editor, PCB layout, and 3D viewer. Components placed in the schematic are available for placement in PCB. Changes to the netlist propagate across all views.

## Core Data Flow

### Simulation Pipeline
```
User draws circuit → Circuit model → SPICE netlist generation
  → ngspice-wasm executes analysis → Parse results
  → Update waveform data → Plotly renders graphs
  → Update virtual instrument displays
```

### PCB Flow
```
Schematic netlist → Component footprints → PCB placement
  → Manual/autoroute tracks → DRC validation
  → Gerber export → 3D visualization
```

## Module Boundaries

| Module | Responsibility | Dependencies |
|--------|---------------|--------------|
| `features/circuit` | Circuit graph model, netlist I/O, validation | none (pure TS) |
| `features/components` | Component catalog, SPICE models, footprints | `circuit` |
| `features/schematic` | Canvas rendering via React Flow | `circuit`, `components` |
| `features/pcb` | PCB layout, routing, Gerber export | `circuit`, `components` |
| `features/pcb3d` | 3D rendering via Three.js | `pcb`, `components` |
| `features/simulation` | ngspice wrapper, analyses, results | `circuit`, `components` |
| `features/project` | File persistence (IndexedDB / File API) | `circuit`, `pcb` |
| `shared/ui` | Reusable UI components | none |
| `shared/hooks` | Custom React hooks | Zustand |
