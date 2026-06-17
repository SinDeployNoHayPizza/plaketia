import type { PlacedComponent } from '../model/types.ts'

export interface BOMEntry {
  reference: string
  type: string
  value: string
  footprint: string
  quantity: number
}

export function generateBOM(
  placedComponents: PlacedComponent[],
  lookupValue: (componentId: string) => string,
): string {
  const entries = new Map<string, BOMEntry>()

  for (const comp of placedComponents) {
    const value = lookupValue(comp.componentId)
    const key = `${comp.footprintName}-${value}-${comp.type}`
    const existing = entries.get(key)
    if (existing) {
      existing.reference += `, ${comp.reference}`
      existing.quantity++
    } else {
      entries.set(key, {
        reference: comp.reference,
        type: comp.type,
        value,
        footprint: comp.footprintName,
        quantity: 1,
      })
    }
  }

  const lines: string[] = []
  lines.push('Reference,Type,Value,Footprint,Quantity')

  for (const entry of entries.values()) {
    const ref = escapeCsv(entry.reference)
    const type = escapeCsv(entry.type)
    const value = escapeCsv(entry.value)
    const fp = escapeCsv(entry.footprint)
    lines.push(`${ref},${type},${value},${fp},${entry.quantity}`)
  }

  return lines.join('\n')
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}
