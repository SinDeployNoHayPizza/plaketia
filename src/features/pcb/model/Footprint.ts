import type { Footprint, FootprintPad } from './types.ts'

function pad(
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: FootprintPad['shape'] = 'round',
  holeDiameter = 0,
): FootprintPad {
  return {
    name,
    position: { x, y },
    size: { width: w, height: h },
    shape,
    holeDiameter,
    layer: 'top',
    netId: '',
  }
}

export const footprints: Record<string, Footprint> = {
  'axial-resistor': {
    name: 'axial-resistor',
    description: 'Axial lead resistor (0.4" spacing)',
    pads: [pad('1', -5.08, 0, 1.8, 1.8, 'round', 0.8), pad('2', 5.08, 0, 1.8, 1.8, 'round', 0.8)],
    outline: [
      { x: -6.5, y: -2 },
      { x: 6.5, y: -2 },
      { x: 6.5, y: 2 },
      { x: -6.5, y: 2 },
    ],
    height: 4.5,
  },

  'radial-capacitor': {
    name: 'radial-capacitor',
    description: 'Radial electrolytic capacitor (5mm pin spacing)',
    pads: [pad('1', -2.5, 0, 1.6, 1.6, 'round', 0.7), pad('2', 2.5, 0, 1.6, 1.6, 'round', 0.7)],
    outline: [
      { x: -4, y: -4 },
      { x: 4, y: -4 },
      { x: 4, y: 4 },
      { x: -4, y: 4 },
    ],
    height: 8,
  },

  'dip-8': {
    name: 'dip-8',
    description: 'DIP-8 (7.62mm row spacing, 2.54mm pitch)',
    pads: Array.from({ length: 8 }, (_, i) => {
      const row = i < 4 ? 0 : 1
      const col = i % 4
      const x = row === 0 ? -3.81 : 3.81
      const y = col * 2.54 - 3.81
      return pad(`${i + 1}`, x, y, 1.6, 1.6, 'round', 0.7)
    }),
    outline: [
      { x: -5.5, y: -5.5 },
      { x: 5.5, y: -5.5 },
      { x: 5.5, y: 5.5 },
      { x: -5.5, y: 5.5 },
    ],
    height: 4,
  },

  'to-92': {
    name: 'to-92',
    description: 'TO-92 transistor (2.54mm pitch)',
    pads: [
      pad('1', -1.27, 1.27, 1.2, 1.2, 'round', 0.5),
      pad('2', -1.27, 0, 1.2, 1.2, 'round', 0.5),
      pad('3', -1.27, -1.27, 1.2, 1.2, 'round', 0.5),
    ],
    outline: [
      { x: -2.5, y: -2.5 },
      { x: 2.5, y: -2.5 },
      { x: 2.5, y: 2.5 },
      { x: -2.5, y: 2.5 },
    ],
    height: 4.5,
  },

  'to-220': {
    name: 'to-220',
    description: 'TO-220 transistor (2.54mm pitch, 3 pins)',
    pads: [
      pad('1', -2.54, 0, 1.8, 1.8, 'round', 0.9),
      pad('2', 0, 0, 1.8, 1.8, 'round', 0.9),
      pad('3', 2.54, 0, 1.8, 1.8, 'round', 0.9),
    ],
    outline: [
      { x: -5, y: -4 },
      { x: 5, y: -4 },
      { x: 5, y: 4 },
      { x: -5, y: 4 },
    ],
    height: 5,
  },

  '0805': {
    name: '0805',
    description: 'SMD 0805 resistor/capacitor',
    pads: [pad('1', -1, 0, 1.25, 1.5, 'rect'), pad('2', 1, 0, 1.25, 1.5, 'rect')],
    outline: [
      { x: -1.5, y: -0.8 },
      { x: 1.5, y: -0.8 },
      { x: 1.5, y: 0.8 },
      { x: -1.5, y: 0.8 },
    ],
    height: 1.5,
  },

  'soic-8': {
    name: 'soic-8',
    description: 'SOIC-8 (1.27mm pitch, 3.9mm body)',
    pads: Array.from({ length: 8 }, (_, i) => {
      const row = i < 4 ? 0 : 1
      const col = i % 4
      const x = row === 0 ? -2.95 : 2.95
      const y = col * 1.27 - 1.905
      return pad(`${i + 1}`, x, y, 0.6, 1.8, 'rect')
    }),
    outline: [
      { x: -3.5, y: -2.5 },
      { x: 3.5, y: -2.5 },
      { x: 3.5, y: 2.5 },
      { x: -3.5, y: 2.5 },
    ],
    height: 1.75,
  },

  'sot-23': {
    name: 'sot-23',
    description: 'SOT-23 (0.95mm pitch)',
    pads: [
      pad('1', -0.95, 0.95, 0.6, 0.9, 'rect'),
      pad('2', 0, 0.95, 0.6, 0.9, 'rect'),
      pad('3', 0.95, 0.95, 0.6, 0.9, 'rect'),
      pad('4', -0.95, -0.95, 0.6, 0.9, 'rect'),
      pad('5', 0, -0.95, 0.6, 0.9, 'rect'),
      pad('6', 0.95, -0.95, 0.6, 0.9, 'rect'),
    ],
    outline: [
      { x: -1.5, y: -1.5 },
      { x: 1.5, y: -1.5 },
      { x: 1.5, y: 1.5 },
      { x: -1.5, y: 1.5 },
    ],
    height: 1.1,
  },
}

export function getFootprint(name: string): Footprint | undefined {
  return footprints[name]
}

export function listFootprintNames(): string[] {
  return Object.keys(footprints)
}

export function suggestFootprint(componentType: string): string {
  const map: Record<string, string> = {
    resistor: 'axial-resistor',
    capacitor: 'radial-capacitor',
    inductor: 'axial-resistor',
    'voltage-source': 'axial-resistor',
    diode: 'axial-resistor',
    bjt: 'to-92',
    'npn-bjt': 'to-92',
    'pnp-bjt': 'to-92',
    mosfet: 'to-220',
    'n-mosfet': 'to-220',
    'p-mosfet': 'to-220',
    jfet: 'to-92',
    'n-jfet': 'to-92',
    'p-jfet': 'to-92',
    opamp: 'dip-8',
    'function-generator': 'dip-8',
    voltmeter: 'axial-resistor',
    ammeter: 'axial-resistor',
  }
  return map[componentType] ?? 'axial-resistor'
}
