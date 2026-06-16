# PCB 3D Visualization

## Overview

The 3D viewer renders a realistic model of the PCB with all mounted components using Three.js via React Three Fiber.

## Tech Stack

| Library | Purpose |
|---------|---------|
| `three` | Core 3D engine |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helpers (OrbitControls, Environment, etc.) |
| `@react-three/postprocessing` | Post-processing effects |

## Scene Composition

```
<R3FCanvas>
  <ambientLight />
  <directionalLight />

  <PCBAssembly>
    <BoardGeometry />        // FR4 substrate + copper layers
    <SolderMask />           // Green solder mask (optional visibility)
    <Silkscreen />           // White text and outlines
    <ComponentModels />      // 3D models of all placed components
    <Pads />                 // Copper pads (exposed)
  </PCBAssembly>

  <OrbitControls />
  <GridHelper />
</R3FCanvas>
```

## Board Geometry

### FR4 Substrate
- Box geometry with board dimensions
- Color: translucent green (`#1b5e20` with alpha)
- Thickness: 1.6mm (configurable)
- Optional beveled edges

### Copper Layers
- Top and bottom copper traces as flat extruded geometries
- Color: copper/orange (`#b87333`)
- Use ShapeGeometry from track outlines
- Apply via `ExtrudeGeometry` with small thickness (0.035mm for 1oz copper)

### Solder Mask
- Slightly larger than copper areas
- Color: green (`#2e7d32`) semi-transparent
- Exposed pads (no mask)

### Silkscreen
- White text and component outlines
- Use `TextGeometry` or sprite-based text
- Component reference designators (R1, C1, Q1, etc.)

## Component 3D Models

### THT (Through-Hole Technology)

| Component | 3D Representation |
|-----------|-------------------|
| Resistor (axial) | Cylinder body + wire leads |
| Capacitor (radial) | Cylinder (taller) + wire leads |
| Diode (DO-41) | Cylinder with band |
| Transistor (TO-92) | Half-cylinder body + 3 pins |
| Transistor (TO-220) | Box with metal tab + 3 pins |
| IC (DIP) | Box body + row of pins on each side |

### SMD (Surface Mount)

| Component | 3D Representation |
|-----------|-------------------|
| Resistor 0805 | Small box with silver end caps |
| Capacitor 0805 | Small box (slightly taller) |
| SOT-23 | Small box + 3 gull-wing pins |
| SOIC-8 | Box + gull-wing pins on sides |
| QFP | Box + pins on 4 sides |

### Model Generation

Component models are generated procedurally (no external 3D files needed):

```typescript
interface ThreeDModel {
  type: 'box' | 'cylinder' | 'custom'
  dimensions: { width: number; height: number; depth: number }
  color: string
  pins?: Pin3D[]
  pinCount?: number
  pinSpacing?: number
  bodyOffset?: number     // height above board
}

function createComponentMesh(model: ThreeDModel): JSX.Element {
  switch (model.type) {
    case 'box':
      return <Box args={[model.dimensions.width, model.dimensions.height, model.dimensions.depth]} />
    case 'cylinder':
      return <Cylinder args={[model.dimensions.width / 2, model.dimensions.width / 2, model.dimensions.height]} />
    // ...
  }
}
```

## Interaction

| Interaction | Implementation |
|-------------|---------------|
| Rotate | OrbitControls (left drag) |
| Pan | OrbitControls (right drag) |
| Zoom | Scroll wheel |
| Select component | Raycaster on click → highlight mesh |
| Hover | Hover effect (emissive glow) |
| Layer visibility | Toggle mesh groups |

## Performance Considerations

- Use `instanced mesh` for repeated components (same footprint type)
- LOD (Level of Detail): simplify when zoomed out
- Limit to ~200 components per board for acceptable performance
- Use `useMemo` for geometry generation
- Dispose geometries on unmount

## Export

- Screenshot via `canvas.toDataURL()`
- Orbit preset views (top, bottom, side)
- Optional: export as GLB for external viewing
