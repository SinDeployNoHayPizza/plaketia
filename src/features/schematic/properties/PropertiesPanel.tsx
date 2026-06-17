import { useCircuitStore } from '@/features/circuit/store.ts'
import { useCallback, useMemo } from 'react'
import { componentRegistry } from '../registry.tsx'
import { useSchematicStore } from '../store.ts'

export function PropertiesPanel() {
  const selectedNodeId = useSchematicStore((s) => s.selectedNodeId)
  const nodes = useSchematicStore((s) => s.nodes)
  const updateNodeData = useSchematicStore((s) => s.updateNodeData)
  const removeNodeAndEdges = useSchematicStore((s) => s.removeNodeAndEdges)

  const circuitComponents = useCircuitStore((s) => s.components)
  const addComponent = useCircuitStore((s) => s.addComponent)

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId],
  )

  const componentData = selectedNode?.data as
    | { reference?: string; value?: string; model?: string; componentType?: string }
    | undefined
  const reg = componentData?.componentType
    ? componentRegistry[componentData.componentType]
    : undefined

  const handleValueChange = useCallback(
    (value: string) => {
      if (!selectedNodeId || !componentData?.componentType) return
      updateNodeData(selectedNodeId, { ...componentData, value } as Record<string, unknown>)
      const comp = circuitComponents.get(selectedNodeId)
      if (comp) {
        comp.value = value
        addComponent(comp)
      }
    },
    [selectedNodeId, componentData, updateNodeData, circuitComponents, addComponent],
  )

  if (!selectedNode || !componentData) {
    return (
      <div className="p-3 text-xs text-gray-400 italic">Select a component to edit properties</div>
    )
  }

  const isGround = selectedNode.type === 'ground'
  const ref = componentData.reference ?? ''
  const value = componentData.value ?? ''
  const model = componentData.model ?? ''

  return (
    <div className="flex flex-col gap-3 p-3 text-xs">
      <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-200 pb-1">
        Properties
      </h3>

      {isGround ? (
        <div className="text-gray-500">Ground node — no properties</div>
      ) : (
        <>
          <Field label="Reference" value={ref} readOnly />

          {reg?.defaultParams?.value !== undefined && (
            <Field label="Value" value={value} onChange={handleValueChange} />
          )}

          {reg?.defaultParams?.model !== undefined && (
            <Field label="Model" value={model} readOnly />
          )}

          <div className="text-[10px] text-gray-400 mt-1">Type: {componentData.componentType}</div>
          <div className="text-[10px] text-gray-400">ID: {selectedNodeId}</div>
        </>
      )}

      <button
        type="button"
        onClick={() => {
          if (selectedNodeId) removeNodeAndEdges(selectedNodeId)
        }}
        className="mt-2 px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-xs font-medium self-start"
      >
        Delete
      </button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
}) {
  const fieldId = `prop-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={fieldId} className="text-gray-500 font-medium">
        {label}
      </label>
      {readOnly ? (
        <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-gray-800">
          {value}
        </div>
      ) : (
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
        />
      )}
    </div>
  )
}
