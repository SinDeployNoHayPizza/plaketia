# Testing Strategy

## Principles

1. **Test behavior, not implementation** — focus on what the code does
2. **Model-first** — the pure TypeScript model layer has the highest test coverage
3. **Component tests for critical UI** — schematics, instruments, dialogs
4. **Integration tests for pipelines** — circuit → netlist → simulation → results
5. **E2E sparingly** — cover critical user flows only

## Test Pyramid

```
        ╱╲
       ╱  ╲         E2E (Playwright)
      ╱    ╲        ────────────────
     ╱ Integ ╲      Integration (Vitest)
    ╱  ration ╲     ────────────────
   ╱────────────╲
  ╱   Unit Tests  ╲    Unit (Vitest)
 ╱    (fastest)    ╲   ────────────────
╱────────────────────╲
╱  Model  │ Utility   ╲
╱  Layer  │ Functions  ╲
```

## Coverage Targets

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Circuit model | 95%+ | Critical |
| Component base | 90%+ | Critical |
| SPICE netlist I/O | 95%+ | Critical |
| PCB model | 85%+ | High |
| Simulation engine | 80%+ | High |
| Schematic nodes | 70%+ | Medium |
| UI components | 60%+ | Medium |

## Unit Tests (`tests/unit/`)

### Circuit Model

```typescript
// Circuit creation
it('creates circuit with nodes and components')
it('adds node')
it('removes node with connected components')
it('finds node by id')
it('validates no floating nodes')
it('detects short circuits')

// Component base
it('generates netlist string for resistor')
it('generates netlist string for BJT')
it('validates pin connections')
it('computes pin count')
it('assigns reference designator automatically')
```

### SPICE I/O

```typescript
it('serializes circuit to SPICE netlist')
it('parses SPICE netlist to circuit')
it('round-trips circuit → netlist → circuit')
it('handles comments and blank lines')
it('parses .model statements')
it('parses .tran analysis directive')
it('parses .dc analysis directive')
it('rejects malformed netlist with error')
```

### PCB Model

```typescript
it('creates board with dimensions')
it('places component on board')
it('detects overlapping components')
it('validates track width against DRC rules')
it('checks clearance between tracks')
it('generates Gerber file for top copper')
it('generates Excellon drill file')
```

## Component Tests (`tests/integration/`)

Uses Vitest + @testing-library/react:

```typescript
// Schematic Node
it('renders resistor symbol with correct pins')
it('handles pin connection click')
it('shows value in node label')
it('updates value on property change')

// Simulation
it('executes DC op point and returns voltages')
it('executes transient analysis and returns waveforms')
it('reports convergence errors')
it('updates voltmeter display after simulation')
it('plots waveform on oscilloscope')
```

## Mocking Strategy

### ngspice-wasm
The WASM module is mocked for tests:

```typescript
// tests/mocks/ngspice.ts
export const mockNgspice = {
  execute: vi.fn(),
  loadWasm: vi.fn().mockResolvedValue(undefined),
}

// Return canned results for known circuits
mockNgspice.execute.mockImplementation((netlist: string) => {
  if (netlist.includes('voltage divider')) {
    return mockVoltageDividerResult
  }
  return mockEmptyResult
})
```

### React Flow
React Flow components are mocked for node/edge interaction tests:

```typescript
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }) => <div>{children}</div>,
  Handle: ({ type }) => <div data-testid={`handle-${type}`} />,
  useReactFlow: () => ({ screenToFlowPosition: vi.fn() }),
  useNodes: () => [],
  useEdges: () => [],
}))
```

### Three.js
Three.js is only tested in integration/E2E with visual snapshots.

## E2E Tests (`tests/e2e/`)

Uses Playwright:

```typescript
test('creates new project and draws a voltage divider', async ({ page }) => {
  await page.click('[data-testid="new-project"]')
  await page.fill('[data-testid="project-name"]', 'Voltage Divider')
  await page.click('[data-testid="create"]')

  // Place resistor
  await page.dragAndDrop('[data-testid="comp-resistor"]', '.react-flow__viewport')
  // Wire it
  await page.click('[data-testid="pin-source"]')
  await page.click('[data-testid="pin-target"]')
  // Run simulation
  await page.click('[data-testid="run-simulation"]')
  // Check voltmeter
  await expect(page.locator('[data-testid="voltmeter-value"]')).toHaveText('5.00')
})

test('loads project and shows PCB 3D view', async ({ page }) => {
  // ...
})
```

## Running Tests

```bash
# All unit and integration tests
bun run test

# Watch mode
bun run test:watch

# With coverage
bun run test:coverage

# E2E tests
bun run test:e2e

# Type checking
bun run typecheck

# Linting
bun run lint
```

## CI Pipeline (GitHub Actions — future)

```yaml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run test:coverage
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: npx playwright install
      - run: bun run test:e2e
```
