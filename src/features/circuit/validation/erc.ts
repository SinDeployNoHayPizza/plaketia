import type { Component } from '@/features/components/base/types.ts'
import type { Circuit } from '../model/Circuit.ts'

export interface ErcIssue {
  type: 'error' | 'warning'
  code: string
  message: string
  componentId?: string
  pinIndex?: number
  nodeId?: string
}

export interface ErcResult {
  issues: ErcIssue[]
  valid: boolean
  errorCount: number
  warningCount: number
}

export function runErc(circuit: Circuit, components: Map<string, Component>): ErcResult {
  const issues: ErcIssue[] = []
  const componentById = new Map<string, Component>()

  for (const comp of components.values()) {
    componentById.set(comp.id, comp)
  }

  checkUnconnectedPins(circuit, componentById, issues)
  checkFloatingInputs(circuit, componentById, issues)
  checkOutputConflicts(circuit, componentById, issues)
  checkDuplicateReferences(componentById, issues)
  checkSinglePinNets(circuit, issues)
  checkGroundReference(circuit, issues)

  const errorCount = issues.filter((i) => i.type === 'error').length
  const warningCount = issues.filter((i) => i.type === 'warning').length

  return {
    issues,
    valid: errorCount === 0,
    errorCount,
    warningCount,
  }
}

function checkUnconnectedPins(
  circuit: Circuit,
  components: Map<string, Component>,
  issues: ErcIssue[],
): void {
  for (const [compId, comp] of components) {
    for (const pin of comp.pins) {
      const node = circuit.getPinNode(compId, pin.index)
      if (!node) {
        const severity = pin.electricalType === 'passive' ? 'warning' : 'error'
        issues.push({
          type: severity,
          code: severity === 'warning' ? 'UNCONNECTED_PIN' : 'UNCONNECTED_PIN_ERROR',
          message: `${comp.reference} pin ${pin.name} (${pin.electricalType}) is not connected`,
          componentId: compId,
          pinIndex: pin.index,
        })
      }
    }
  }
}

function checkFloatingInputs(
  circuit: Circuit,
  components: Map<string, Component>,
  issues: ErcIssue[],
): void {
  for (const [compId, comp] of components) {
    for (const pin of comp.pins) {
      if (pin.electricalType !== 'input') continue
      const node = circuit.getPinNode(compId, pin.index)
      if (!node) {
        issues.push({
          type: 'error',
          code: 'FLOATING_INPUT',
          message: `${comp.reference} pin ${pin.name} (input) is floating`,
          componentId: compId,
          pinIndex: pin.index,
        })
      }
    }
  }
}

function checkOutputConflicts(
  circuit: Circuit,
  components: Map<string, Component>,
  issues: ErcIssue[],
): void {
  const nodeOutputs = new Map<string, Array<{ compId: string; ref: string; pinName: string }>>()

  for (const [compId, comp] of components) {
    for (const pin of comp.pins) {
      if (pin.electricalType !== 'output') continue
      const node = circuit.getPinNode(compId, pin.index)
      if (!node) continue
      const entries = nodeOutputs.get(node.id) ?? []
      entries.push({ compId, ref: comp.reference, pinName: pin.name })
      nodeOutputs.set(node.id, entries)
    }
  }

  for (const [nodeId, outputs] of nodeOutputs) {
    if (outputs.length > 1) {
      const refs = outputs.map((o) => `${o.ref}.${o.pinName}`).join(', ')
      issues.push({
        type: 'error',
        code: 'OUTPUT_CONFLICT',
        message: `Output conflict on node ${nodeId}: ${refs}`,
        nodeId,
      })
    }
  }
}

function checkDuplicateReferences(components: Map<string, Component>, issues: ErcIssue[]): void {
  const refMap = new Map<string, string[]>()
  for (const comp of components.values()) {
    const list = refMap.get(comp.reference) ?? []
    list.push(comp.id)
    refMap.set(comp.reference, list)
  }
  for (const [ref, ids] of refMap) {
    if (ids.length > 1) {
      for (const id of ids) {
        issues.push({
          type: 'error',
          code: 'DUPLICATE_REFERENCE',
          message: `Duplicate reference: ${ref} used by ${ids.length} components`,
          componentId: id,
        })
      }
    }
  }
}

function checkSinglePinNets(circuit: Circuit, issues: ErcIssue[]): void {
  for (const node of circuit.nodes.values()) {
    if (node.type === 'ground') continue
    const connections = circuit.getConnectionsForNode(node.id)
    if (connections.length === 1) {
      issues.push({
        type: 'warning',
        code: 'SINGLE_PIN_NET',
        message: `Node ${node.id} has only one connection (dangling net)`,
        nodeId: node.id,
      })
    }
  }
}

function checkGroundReference(circuit: Circuit, issues: ErcIssue[]): void {
  const groundNode = circuit.nodes.get('GND')
  if (!groundNode) return
  const groundConnections = circuit.getConnectionsForNode('GND')
  if (groundConnections.length === 0) {
    issues.push({
      type: 'warning',
      code: 'NO_GROUND',
      message: 'Circuit has no ground reference',
    })
  }
}
