# Plaketia

Herramienta de diseño y análisis electrónico analógico (EDA) basada en navegador. Captura de esquemáticos, simulación SPICE, diseño de PCB de una sola cara y visualización 3D — todo en el navegador, sin instalación.

## Características

- **Editor de Esquemáticos** — Arrastra y suelta componentes, dibuja conexiones, edita propiedades. Compatible con componentes pasivos (resistencias, condensadores, inductores), activos (MOSFETs, BJTs, JFETs, amplificadores operacionales) e instrumentos (voltímetro, amperímetro, generador de funciones).
- **Simulación SPICE** — Ejecuta análisis de punto de operación DC y transitorio mediante ngspice-wasm directamente en el navegador.
- **Diseño de PCB** — Editor 2D con colocación de componentes, ruteo manual de trazos (click para rutear, vías, snap-to-grid), verificación de reglas de diseño (DRC), resaltado de netlist (rat's nest).
- **Exportación** — Gerber RS-274X (cobre superior/inferior, serigrafía, contorno, perforaciones) y BOM (CSV).
- **Visor 3D** — Visualización interactiva del PCB con Three.js.

## Tecnologías

Bun · React 19 · TypeScript · Vite 6 · Zustand · @xyflow/react (React Flow) · Three.js / R3F · ngspice-wasm · Plotly.js · Tailwind CSS 4 · Vitest · Playwright · Biome

## Primeros Pasos

### Requisitos

- [Bun](https://bun.sh) 1.2+

### Clonar y ejecutar

```bash
git clone https://github.com/SinDeployNoHayPizza/plaketia.git
cd plaketia
bun install
bun run dev
```

Abre `http://localhost:5173` en tu navegador.

### Compilar para producción

```bash
bun run build
```

La salida se genera en `dist/`.

## Ejecutar Tests

```bash
bun run test            # Ejecutar todos los tests
bun run test:coverage   # Con informe de cobertura
bun run typecheck       # Verificación de tipos TypeScript
bun run lint            # Biome lint + formato
```

## Estructura del Proyecto

```
src/
├── features/
│   ├── circuit/          # Modelo de circuito (TS puro, sin React)
│   ├── components/       # Definiciones de componentes (resistor, mosfet, etc.)
│   ├── schematic/        # Editor de esquemáticos basado en React Flow
│   ├── simulation/       # Envoltorio ngspice-wasm, generación de netlist
│   ├── pcb/              # Diseño de PCB (modelo, lienzo, exportación)
│   ├── pcb3d/            # Visor 3D con Three.js
│   └── project/          # Guardar/cargar archivos
├── screens/              # Componentes de pantalla principales
└── shared/               # Componentes UI compartidos
```

## Licencia

MIT
