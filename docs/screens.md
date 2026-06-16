# Screens

## 1. ProjectManager — Project Management

**Route:** `/projects`

**Purpose:** Create, open, rename, and delete projects. Single-user file system access.

**Layout:**
```
┌──────────────────────────────────────┐
│  Plaketia        [New Project] [+]  │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ Project 1              [delete] │ │
│ │ Last opened: 2026-06-16         │ │
│ ├──────────────────────────────────┤ │
│ │ Project 2              [delete] │ │
│ │ Last opened: 2026-06-15         │ │
│ └──────────────────────────────────┘ │
│  [Open file...]                      │
└──────────────────────────────────────┘
```

**States:** Empty state (no projects), list state, loading state.

---

## 2. SchematicEditor — Schematic Capture

**Route:** `/project/:id/schematic`

**Purpose:** Draw circuit diagrams by dragging components and wiring them.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Menu Bar [File] [Edit] [View] [Simulate] [Export]   │
├──────────┬───────────────────────────────────────────┤
│ Toolbar  │                                           │
│ ┌──────┐ │            Canvas (React Flow)             │
│ │Select │ │                                           │
│ │Wire   │ │     ┌──────┐                             │
│ │Move   │ │     │ R1   │───┐                         │
│ ├──────┤ │     │ 10k  │   │                         │
│ │ R     │ │     └──────┘   │                         │
│ │ C     │ │                ├──────┐                  │
│ │ L     │ │     ┌──────┐   │      │                  │
│ │ D     │ │     │ Q1   │───┘      │                  │
│ │ Q     │ │     │2N2222│──────────┘                  │
│ │ M     │ │     └──────┘                             │
│ │ U     │ │                                           │
│ │ V     │ │                                           │
│ └──────┘ │                                           │
├──────────┴───────────────────────────────────────────┤
│  Properties Panel  │  Status Bar                      │
│  Type: Resistor     │  Nodes: 5  Components: 4        │
│  Value: 10k Ω       │                                 │
└─────────────────────┴─────────────────────────────────┘
```

**Key interactions:**
- Drag component from toolbar to canvas
- Click on pin handle, drag wire to another pin handle
- Double-click component to edit properties
- Right-click context menu (delete, rotate, copy)
- Scroll to zoom, drag to pan

**States:** Empty canvas, editing, simulation running (disabled edits).

---

## 3. PCBLayout — PCB Layout Editor

**Route:** `/project/:id/pcb`

**Purpose:** Place components on single-sided board, route traces, validate DRC.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  PCB Menu [Route] [DRC] [Export] [3D View]           │
├──────────┬───────────────────────────────────────────┤
│ Component│                                           │
│ List     │      PCB Canvas (2D top view)              │
│ ┌──────┐ │                                           │
│ │ R1   │ │   ┌────┐                                  │
│ │ C1   │ │   │ R1 │═══╗                             │
│ │ Q1   │ │   └────┘   ║                             │
│ │ ...  │ │   ┌────┐   ║   ┌────┐                    │
│ └──────┘ │   │ C1 │═══╝   │ Q1 │                    │
│           │   └────┘       └────┘                    │
│ Layers:   │                                           │
│ [x] Copper│  Grid: 1.27mm (50mil)                    │
│ [x] Silk  │                                           │
│ [x] Mask  │                                           │
└──────────┴───────────────────────────────────────────┘
```

**Key interactions:**
- Drag components from list onto board
- Route traces: click start, click waypoints, click end
- DRC highlights violations in red
- Layer visibility toggles

---

## 4. PCB3DViewer — 3D PCB Visualization

**Route:** `/project/:id/pcb3d`

**Purpose:** Interactive 3D view of the PCB with mounted components.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  3D Controls [Rotate] [Zoom] [Pan]  [Reset View]     │
├──────────────────────────────────────────────────────┤
│                                                       │
│              ┌─────────────────┐                      │
│              │    PCB 3D       │                      │
│              │  ┌───────────┐  │                      │
│              │  │ R1  C1    │  │                      │
│              │  │           │  │                      │
│              │  │    Q1     │  │                      │
│              │  └───────────┘  │                      │
│              │   FR4 (green)   │                      │
│              └─────────────────┘                      │
│                                                       │
├──────────────────────────────────────────────────────┤
│  Layer overlay toggles  │  Component list (clickable) │
└──────────────────────────────────────────────────────┘
```

**Key interactions:**
- Orbit controls (rotate, zoom, pan)
- Click component → highlight in 3D and show info
- Toggle layer visibility (copper, silk, mask, substrate)
- Export screenshot

---

## 5. SimulationPanel — Simulation & Instruments

**Route:** `/project/:id/simulate`

**Purpose:** Configure and run SPICE simulations, view results, use virtual instruments.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Simulation [Run] [Stop] [Analysis Type ▼]            │
├─────────────────────┬────────────────────────────────┤
│ Instruments         │   Waveform Display              │
│ ┌─────────────────┐ │   ┌──────────────────────────┐ │
│ │ Voltmeter V(N001)│ │   │    V(N001)              │ │
│ │ ┌─────────────┐ │ │   │   ╱╲                     │ │
│ │ │  5.23 V     │ │ │   │  ╱  ╲    ╱╲              │ │
│ │ └─────────────┘ │ │   │ ╱    ╲  ╱  ╲            │ │
│ ├─────────────────┤ │   │╱      ╲╱    ╲           │ │
│ │ Ammeter I(R1)   │ │   └──────────────────────────┘ │
│ │ ┌─────────────┐ │ │   Time (ms)                    │
│ │ │  1.2 mA     │ │ │                                │
│ │ └─────────────┘ │ │   [Add cursor] [Zoom] [Export] │
│ ├─────────────────┤ │                                │
│ │ Function Gen    │ │                                │
│ │ [1kHz ▼] [5V ▼]│ │                                │
│ └─────────────────┘ │                                │
├─────────────────────┴────────────────────────────────┤
│  Console / SPICE log                                 │
│  > DC operating point solved                         │
│  > V(N001) = 5.23V                                  │
└──────────────────────────────────────────────────────┘
```

**Key interactions:**
- Select analysis type (DC op, transient, AC sweep)
- Configure analysis parameters (stop time, step, frequency range)
- Place virtual instruments on schematic → they appear here
- Click Run → ngspice executes → waveforms render
- Cursors on waveforms for measurement
- Export data as CSV

---

## 6. ComponentLibrary — Component Browser

**Route:** `/library`

**Purpose:** Browse, search, and inspect available components and their SPICE models.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Library                 [Search...]    [Filter ▼]   │
├──────────┬───────────────────────────────────────────┤
│ Category │  Component List                           │
│ ┌──────┐ │  ┌─────────────────────────────────────┐ │
│ │ All  │ │  │ Resistor  10kΩ  0805   [Add] [Info] │ │
│ │Passiv│ │  │ Resistor  1kΩ   axial  [Add] [Info] │ │
│ │Active│ │  │ Capacitor 100nF 0805   [Add] [Info] │ │
│ │Source│ │  │ 2N2222    NPN   TO-92  [Add] [Info] │ │
│ │Inst. │ │  │ LM741     OpAmp DIP-8  [Add] [Info] │ │
│ └──────┘ │  └─────────────────────────────────────┘ │
│           │                                          │
│           │  Preview:                                │
│           │  ┌────────────────────────────────────┐  │
│           │  │  Symbol preview    Footprint        │  │
│           │  │    ┌─┐           ┌─────────┐       │  │
│           │  │    │ │           │ ○  ○   ○│       │  │
│           │  │    └─┘           │         │       │  │
│           │  │                  │ ○  ○   ○│       │  │
│           │  │                  └─────────┘       │  │
│           │  └────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────┘
```

**States:** Loading, loaded, empty search results, error (failed to load catalog).

---

## Navigation Flow

```
ProjectManager
  ├── [New Project / Open] → SchematicEditor
  │     ├── Toolbar → [PCB Layout] → PCBLayout
  │     │     └── [3D View] → PCB3DViewer
  │     └── Toolbar → [Simulate] → SimulationPanel
  ├── [Library] → ComponentLibrary → [Back to project]
  └── [Settings] → (modal)
```
