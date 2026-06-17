import { JfetN } from '@/features/components/active/JfetN.ts'
import { MosfetN } from '@/features/components/active/MosfetN.ts'
import { Ammeter } from '@/features/components/instruments/Ammeter.ts'
import { Voltmeter } from '@/features/components/instruments/Voltmeter.ts'
import { Capacitor } from '@/features/components/passive/Capacitor.ts'
import { Inductor } from '@/features/components/passive/Inductor.ts'
import { Resistor } from '@/features/components/passive/Resistor.ts'
import { CurrentSource } from '@/features/components/sources/CurrentSource.ts'
import { FunctionGenerator } from '@/features/components/sources/FunctionGenerator.ts'
import { VddSource } from '@/features/components/sources/VddSource.ts'
import { VoltageSource } from '@/features/components/sources/VoltageSource.ts'
import type { ComponentType, SVGProps } from 'react'

export interface SchematicPinDef {
  index: number
  x: number
  y: number
  label?: string
}

export interface ComponentRegistration {
  type: string
  label: string
  category: 'passive' | 'active' | 'source' | 'instrument' | 'ic'
  defaultReference: string
  defaultParams: Record<string, unknown>
  createModel: (id: string) => unknown
  width: number
  height: number
  pins: SchematicPinDef[]
  symbol: ComponentType<SVGProps<SVGSVGElement>>
  getPinName?: (index: number) => string
}

const zigzag = (
  <polyline
    points="10,25 20,15 25,35 30,15 35,35 40,15 45,35 50,15 55,25"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  />
)

const ResistorSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="10" y2="25" stroke="currentColor" strokeWidth="1.5" />
    {zigzag}
    <line x1="55" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const CapacitorSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="30" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <line x1="30" y1="10" x2="30" y2="40" stroke="currentColor" strokeWidth="1.5" />
    <line x1="33" y1="10" x2="33" y2="40" stroke="currentColor" strokeWidth="1.5" />
    <line x1="33" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const InductorSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M15,25 Q20,10 25,25 Q30,10 35,25 Q40,10 45,25 Q50,10 55,25 Q60,10 65,25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line x1="65" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const DiodeSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 60 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="20" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="20,10 20,40 45,25" fill="currentColor" />
    <line x1="45" y1="10" x2="45" y2="40" stroke="currentColor" strokeWidth="1.5" />
    <line x1="45" y1="25" x2="60" y2="25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const BJT_NPN_Symbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 70" width="100%" height="100%" overflow="visible">
    <line x1="40" y1="0" x2="40" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="0" y1="35" x2="28" y2="35" stroke="currentColor" strokeWidth="1.5" />
    <line x1="40" y1="58" x2="40" y2="70" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="28,20 28,50 55,35" fill="currentColor" />
    <line x1="40" y1="35" x2="55" y2="35" stroke="currentColor" strokeWidth="1.5" />
    <line x1="32" y1="12" x2="48" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="48" y1="12" x2="48" y2="6" stroke="currentColor" strokeWidth="1.5" />
    <line x1="48" y1="6" x2="52" y2="6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const VoltageSourceSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="40" cy="25" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="40" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
      V
    </text>
    <line x1="15" y1="18" x2="15" y2="32" stroke="currentColor" strokeWidth="1" />
    <line x1="12" y1="32" x2="18" y2="32" stroke="currentColor" strokeWidth="1" />
    <line x1="65" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <line x1="65" y1="18" x2="65" y2="32" stroke="currentColor" strokeWidth="1" />
  </svg>
)

const CurrentSourceSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="40" cy="25" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="40" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
      I
    </text>
    <line x1="65" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <line x1="65" y1="10" x2="65" y2="40" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="68,10 62,17 68,17" fill="currentColor" />
  </svg>
)

const FunctionGeneratorSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="40" cy="25" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="40" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
      FG
    </text>
    <path
      d="M20,25 Q24,18 28,25 Q32,32 36,25 Q40,18 44,25 Q48,32 52,25 Q56,18 60,25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
    <line x1="65" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <line x1="65" y1="18" x2="65" y2="32" stroke="currentColor" strokeWidth="1" />
  </svg>
)

export const GroundSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 30 40" width="100%" height="100%" overflow="visible">
    <line x1="15" y1="0" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" />
    <line x1="5" y1="15" x2="25" y2="15" stroke="currentColor" strokeWidth="1.5" />
    <line x1="8" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="1.5" />
    <line x1="11" y1="27" x2="19" y2="27" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const VoltmeterSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <rect
      x="15"
      y="12"
      width="50"
      height="26"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <text x="40" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">
      V
    </text>
    <line x1="65" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const AmmeterSymbol = (_props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden={true} viewBox="0 0 80 50" width="100%" height="100%" overflow="visible">
    <line x1="0" y1="25" x2="15" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <rect
      x="15"
      y="12"
      width="50"
      height="26"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <text x="40" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">
      A
    </text>
    <line x1="65" y1="25" x2="80" y2="25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

export const componentRegistry: Record<string, ComponentRegistration> = {
  resistor: {
    type: 'resistor',
    label: 'Resistor',
    category: 'passive',
    defaultReference: 'R',
    defaultParams: { value: '1k' },
    createModel: (id: string) => Resistor.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '1' },
      { index: 1, x: 80, y: 25, label: '2' },
    ],
    symbol: ResistorSymbol,
    getPinName: (i: number) => `${i + 1}`,
  },
  capacitor: {
    type: 'capacitor',
    label: 'Capacitor',
    category: 'passive',
    defaultReference: 'C',
    defaultParams: { value: '100nF' },
    createModel: (id: string) => Capacitor.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '+' },
      { index: 1, x: 80, y: 25, label: '-' },
    ],
    symbol: CapacitorSymbol,
    getPinName: (i: number) => (i === 0 ? '+' : '-'),
  },
  inductor: {
    type: 'inductor',
    label: 'Inductor',
    category: 'passive',
    defaultReference: 'L',
    defaultParams: { value: '10mH' },
    createModel: (id: string) => Inductor.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '1' },
      { index: 1, x: 80, y: 25, label: '2' },
    ],
    symbol: InductorSymbol,
    getPinName: (i: number) => `${i + 1}`,
  },
  diode: {
    type: 'diode',
    label: 'Diode',
    category: 'active',
    defaultReference: 'D',
    defaultParams: { value: '1N4148' },
    createModel: (id: string) => {
      const D = { id, reference: 'D1', value: '1N4148', type: 'diode' } as const
      return D
    },
    width: 60,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: 'A' },
      { index: 1, x: 60, y: 25, label: 'K' },
    ],
    symbol: DiodeSymbol,
    getPinName: (i: number) => (i === 0 ? 'A' : 'K'),
  },
  'bjt-npn': {
    type: 'bjt-npn',
    label: 'BJT NPN',
    category: 'active',
    defaultReference: 'Q',
    defaultParams: { model: '2N2222' },
    createModel: (id: string) => {
      const Q = { id, reference: 'Q1', model: '2N2222', type: 'bjt-npn' } as const
      return Q
    },
    width: 80,
    height: 70,
    pins: [
      { index: 0, x: 40, y: 0, label: 'C' },
      { index: 1, x: 0, y: 35, label: 'B' },
      { index: 2, x: 40, y: 70, label: 'E' },
    ],
    symbol: BJT_NPN_Symbol,
    getPinName: (i: number) => ['C', 'B', 'E'][i] ?? `P${i}`,
  },
  'voltage-source': {
    type: 'voltage-source',
    label: 'VSource',
    category: 'source',
    defaultReference: 'V',
    defaultParams: { value: '5V' },
    createModel: (id: string) => VoltageSource.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '+' },
      { index: 1, x: 80, y: 25, label: '-' },
    ],
    symbol: VoltageSourceSymbol,
    getPinName: (i: number) => (i === 0 ? '+' : '-'),
  },
  'current-source': {
    type: 'current-source',
    label: 'ISource',
    category: 'source',
    defaultReference: 'I',
    defaultParams: { value: '1mA' },
    createModel: (id: string) => CurrentSource.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '+' },
      { index: 1, x: 80, y: 25, label: '-' },
    ],
    symbol: CurrentSourceSymbol,
    getPinName: (i: number) => (i === 0 ? '+' : '-'),
  },
  'function-generator': {
    type: 'function-generator',
    label: 'FuncGen',
    category: 'source',
    defaultReference: 'FG',
    defaultParams: {
      value: '5V DC',
      waveform: 'dc',
      amplitude: '5',
      frequency: '1k',
      offset: '0',
      v1: '0',
      v2: '5',
      delay: '0',
      rise: '1u',
      fall: '1u',
      width: '0.5m',
      period: '1m',
    },
    createModel: (id: string) => FunctionGenerator.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '+' },
      { index: 1, x: 80, y: 25, label: '-' },
    ],
    symbol: FunctionGeneratorSymbol,
    getPinName: (i: number) => (i === 0 ? '+' : '-'),
  },
  voltmeter: {
    type: 'voltmeter',
    label: 'Voltmeter',
    category: 'instrument',
    defaultReference: 'VM',
    defaultParams: { value: '0V' },
    createModel: (id: string) => Voltmeter.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '+' },
      { index: 1, x: 80, y: 25, label: '-' },
    ],
    symbol: VoltmeterSymbol,
    getPinName: (i: number) => (i === 0 ? '+' : '-'),
  },
  ammeter: {
    type: 'ammeter',
    label: 'Ammeter',
    category: 'instrument',
    defaultReference: 'AM',
    defaultParams: { value: '0A' },
    createModel: (id: string) => Ammeter.create(id),
    width: 80,
    height: 50,
    pins: [
      { index: 0, x: 0, y: 25, label: '+' },
      { index: 1, x: 80, y: 25, label: '-' },
    ],
    symbol: AmmeterSymbol,
    getPinName: (i: number) => (i === 0 ? '+' : '-'),
  },
  'mosfet-n': {
    type: 'mosfet-n',
    label: 'MOSFET N',
    category: 'active',
    defaultReference: 'M',
    defaultParams: { model: 'NMOS' },
    createModel: (id: string) => MosfetN.create(id),
    width: 80,
    height: 80,
    pins: [
      { index: 0, x: 0, y: 20, label: 'D' },
      { index: 1, x: 40, y: 0, label: 'G' },
      { index: 2, x: 40, y: 80, label: 'S' },
      { index: 3, x: 80, y: 40, label: 'B' },
    ],
    symbol: MosfetNSymbol,
    getPinName: (i: number) => ['D', 'G', 'S', 'B'][i] ?? `P${i}`,
  },
  'jfet-n': {
    type: 'jfet-n',
    label: 'JFET N',
    category: 'active',
    defaultReference: 'J',
    defaultParams: { model: 'NJF' },
    createModel: (id: string) => JfetN.create(id),
    width: 80,
    height: 70,
    pins: [
      { index: 0, x: 0, y: 20, label: 'D' },
      { index: 1, x: 40, y: 0, label: 'G' },
      { index: 2, x: 40, y: 70, label: 'S' },
    ],
    symbol: JfetNSymbol,
    getPinName: (i: number) => ['D', 'G', 'S'][i] ?? `P${i}`,
  },
  vdd: {
    type: 'vdd',
    label: 'VDD',
    category: 'source',
    defaultReference: 'VDD',
    defaultParams: { value: '5V' },
    createModel: (id: string) => VddSource.create(id),
    width: 30,
    height: 40,
    pins: [{ index: 0, x: 15, y: 40, label: 'VDD' }],
    symbol: VddSymbol,
    getPinName: (_i: number) => 'VDD',
  },
}

function MosfetNSymbol(_props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden={true} viewBox="0 0 80 80" width="100%" height="100%" overflow="visible">
      <line x1="0" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="0" x2="40" y2="15" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="65" x2="40" y2="80" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="20" x2="20" y2="60" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="60" x2="40" y2="60" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="60" x2="40" y2="65" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="30" x2="27" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="50" x2="37" y2="55" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="50" x2="35" y2="42" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="20" x2="48" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="48" y1="20" x2="48" y2="15" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function JfetNSymbol(_props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden={true} viewBox="0 0 80 70" width="100%" height="100%" overflow="visible">
      <line x1="0" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="0" x2="40" y2="15" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="55" x2="40" y2="70" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="20" x2="20" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="50" x2="40" y2="55" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="25" x2="27" y2="45" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="25" x2="37" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="25" x2="35" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="20" x2="46" y2="20" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export function VddSymbol(_props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden={true} viewBox="0 0 30 40" width="100%" height="100%" overflow="visible">
      <line x1="15" y1="40" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="20" x2="25" y2="20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export const groundRegistration = {
  type: 'ground',
  label: 'Ground',
  category: 'source' as const,
  defaultReference: 'GND',
  width: 30,
  height: 40,
  pins: [{ index: 0, x: 15, y: 0 }],
  symbol: GroundSymbol,
}

export const vddRegistration = {
  type: 'vdd',
  label: 'VDD',
  category: 'source' as const,
  defaultReference: 'VDD',
  defaultParams: { value: '5V' },
  createModel: (id: string) => VddSource.create(id),
  width: 30,
  height: 40,
  pins: [
    { index: 0, x: 15, y: 40, label: 'VDD' },
    { index: 1, x: 15, y: 0, label: 'GND' },
  ],
  symbol: VddSymbol,
  getPinName: (i: number) => (i === 0 ? 'VDD' : 'GND'),
}

export const componentCategories: Record<string, Array<keyof typeof componentRegistry>> = {
  passive: ['resistor', 'capacitor', 'inductor'],
  active: ['diode', 'bjt-npn', 'mosfet-n', 'jfet-n'],
  source: ['voltage-source', 'current-source', 'function-generator', 'vdd'],
  instrument: ['voltmeter', 'ammeter'],
}
