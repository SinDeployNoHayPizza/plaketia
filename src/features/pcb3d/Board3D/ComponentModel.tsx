import type { FC } from 'react'
import { AxialResistorModel } from './models/AxialResistorModel.tsx'
import { DIP8Model } from './models/DIP8Model.tsx'
import { GenericModel } from './models/GenericModel.tsx'
import { RadialCapacitorModel } from './models/RadialCapacitorModel.tsx'
import { SMD0805Model } from './models/SMD0805Model.tsx'
import { SOIC8Model } from './models/SOIC8Model.tsx'
import { SOT23Model } from './models/SOT23Model.tsx'
import { TO92Model } from './models/TO92Model.tsx'
import { TO220Model } from './models/TO220Model.tsx'
import type { ModelProps } from './models/common.tsx'

const modelMap: Record<string, FC<ModelProps>> = {
  'axial-resistor': AxialResistorModel,
  'radial-capacitor': RadialCapacitorModel,
  'dip-8': DIP8Model,
  'to-92': TO92Model,
  'to-220': TO220Model,
  '0805': SMD0805Model,
  'soic-8': SOIC8Model,
  'sot-23': SOT23Model,
}

export function ComponentModel({ component, selected, onClick }: ModelProps) {
  const Model = modelMap[component.footprintName] ?? GenericModel
  return <Model component={component} selected={selected} onClick={onClick} />
}
