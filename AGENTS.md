# Plaketia — AI Agent Guide

## Project Overview

Plaketia is a browser-based analog electronics design and analysis tool (EDA). Single-user, no login required. Schematic capture, SPICE simulation via ngspice-wasm, single-sided PCB layout, and 3D PCB visualization.

## Stack

- **Runtime**: Bun 1.2+
- **Frontend**: React 19 + TypeScript 5 + Vite 6
- **State**: Zustand (slices for circuit, schematic, PCB, simulation)
- **Schematic**: @xyflow/react 12.x (React Flow)
- **3D**: Three.js + @react-three/fiber + @react-three/drei
- **Simulation**: ngspice-wasm (SPICE in browser)
- **Plotting**: Plotly.js
- **CSS**: Tailwind CSS 4
- **Testing**: Vitest + @testing-library/react + Playwright
- **Lint/Format**: Biome

## Code Conventions

- **Files**: PascalCase for components/screens, camelCase for hooks/utils/models
- **Types**: Prefer interfaces over types, named exports only
- **Imports**: Colocated with feature (no barrel imports)
- **State**: Zustand stores in each feature folder (`feature/store.ts`)
- **Tests**: Colocated as `*.test.ts` / `*.test.tsx` next to source
- **No comments** in code unless explaining a non-obvious decision

## Architecture Rules

1. **Circuit model is pure TS** — no React dependencies in `features/circuit/`
2. **Components implement `Component` interface** — see `features/components/base/types.ts`
3. **Simulation goes through ngspice-wasm only** — no custom solver
4. **Schematic ↔ PCB sync via netlist** — not direct state sharing
5. **New component types** go in `features/components/` with proper category folder

## Before Making Changes

1. Read relevant docs in `docs/` folder
2. Check existing tests for the module
3. Verify model backward compatibility with SPICE netlist format
4. Run `bun run typecheck` and `bun run lint` after changes

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run test         # Run tests
bun run test:coverage
bun run typecheck    # TypeScript check (tsc --noEmit)
bun run lint         # Biome lint + format
```

## Key Files

| File | Purpose |
|------|---------|
| `src/features/circuit/model/Circuit.ts` | Core circuit graph |
| `src/features/components/base/Component.ts` | Abstract component interface |
| `src/features/simulation/engine/ngspice.ts` | ngspice-wasm wrapper |
| `src/features/schematic/nodes/` | Custom React Flow nodes |
| `src/features/pcb3d/Board3D/BoardGeometry.tsx` | 3D board rendering |
| `src/features/project/persistence.ts` | File save/load |
