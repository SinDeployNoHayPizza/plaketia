import { useCircuitStore } from '@/features/circuit/store.ts'
import { useCallback, useMemo } from 'react'
import { componentRegistry } from '../registry.tsx'
import { useSchematicStore } from '../store.ts'

function updateComponent(
  compId: string,
  patch: Record<string, unknown>,
  componentData: Record<string, unknown>,
  updateNodeData: (id: string, data: Record<string, unknown>) => void,
  circuitComponents: Map<
    string,
    { metadata: Record<string, unknown>; value: string; reference: string }
  >,
  addComponent: (comp: unknown) => void,
) {
  const comp = circuitComponents.get(compId)
  if (!comp) return
  updateNodeData(compId, { ...componentData, ...patch })
  Object.assign(comp, patch)
  addComponent(comp)
}

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

  const handleMetaChange = useCallback(
    (key: string, val: string) => {
      if (!selectedNodeId || !componentData) return
      const comp = circuitComponents.get(selectedNodeId) as
        | { metadata: Record<string, unknown>; value: string; reference: string }
        | undefined
      if (!comp) return
      comp.metadata[key] = val
      const wf = (comp.metadata.waveform as string) ?? 'dc'
      let summary: string
      if (wf === 'dc') summary = `${comp.metadata.amplitude ?? '5'}V DC`
      else if (wf === 'sine') summary = `SINE ${comp.metadata.frequency ?? '1k'}Hz`
      else if (wf === 'pulse')
        summary = `PULSE ${comp.metadata.v2 ?? '5'}V ${comp.metadata.period ?? '1m'}`
      else summary = val
      comp.value = summary
      updateNodeData(selectedNodeId, {
        ...componentData,
        value: comp.value,
      } as Record<string, unknown>)
      addComponent(comp)
    },
    [selectedNodeId, componentData, updateNodeData, circuitComponents, addComponent],
  )

  if (!selectedNode || !componentData) {
    return (
      <div className="p-3 text-xs text-gray-400 italic">Select a component to edit properties</div>
    )
  }

  const isGround = selectedNode.type === 'ground'
  const isVdd = selectedNode.type === 'vdd'
  const isFuncGen = componentData.componentType === 'function-generator'
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
      ) : isVdd ? (
        <>
          <Field
            label="Reference"
            value={ref}
            onChange={(v) =>
              updateComponent(
                selectedNodeId!,
                { reference: v },
                componentData,
                updateNodeData,
                circuitComponents,
                addComponent,
              )
            }
          />
          <Field label="Voltage" value={value} onChange={handleValueChange} />
          <div className="text-[10px] text-gray-400 mt-1">Type: vdd</div>
          <div className="text-[10px] text-gray-400">ID: {selectedNodeId}</div>
        </>
      ) : isFuncGen ? (
        <>
          <Field label="Reference" value={ref} readOnly />
          <Field label="Value" value={value} readOnly />
          <FuncGenFields
            metadata={
              (circuitComponents.get(selectedNodeId!) as { metadata: Record<string, unknown> })
                ?.metadata ?? {}
            }
            onChange={handleMetaChange}
          />
          <div className="text-[10px] text-gray-400 mt-1">Type: function-generator</div>
          <div className="text-[10px] text-gray-400">ID: {selectedNodeId}</div>
        </>
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

function FuncGenFields({
  metadata,
  onChange,
}: {
  metadata: Record<string, unknown>
  onChange: (key: string, val: string) => void
}) {
  const wf = (metadata.waveform as string) ?? 'dc'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <label htmlFor="funcgen-waveform" className="text-gray-500 font-medium">
          Waveform
        </label>
        <select
          id="funcgen-waveform"
          value={wf}
          onChange={(e) => onChange('waveform', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
        >
          <option value="dc">DC</option>
          <option value="sine">SINE</option>
          <option value="pulse">PULSE</option>
        </select>
      </div>

      {wf === 'dc' && (
        <SmallField
          label="Voltage"
          value={(metadata.amplitude as string) ?? '5'}
          onChange={(v) => onChange('amplitude', v)}
        />
      )}

      {wf === 'sine' && (
        <>
          <SmallField
            label="Amplitude"
            value={(metadata.amplitude as string) ?? '5'}
            onChange={(v) => onChange('amplitude', v)}
          />
          <SmallField
            label="Frequency"
            value={(metadata.frequency as string) ?? '1k'}
            onChange={(v) => onChange('frequency', v)}
          />
          <SmallField
            label="Offset"
            value={(metadata.offset as string) ?? '0'}
            onChange={(v) => onChange('offset', v)}
          />
        </>
      )}

      {wf === 'pulse' && (
        <>
          <SmallField
            label="V1 (low)"
            value={(metadata.v1 as string) ?? '0'}
            onChange={(v) => onChange('v1', v)}
          />
          <SmallField
            label="V2 (high)"
            value={(metadata.v2 as string) ?? '5'}
            onChange={(v) => onChange('v2', v)}
          />
          <SmallField
            label="Delay"
            value={(metadata.delay as string) ?? '0'}
            onChange={(v) => onChange('delay', v)}
          />
          <SmallField
            label="Rise"
            value={(metadata.rise as string) ?? '1u'}
            onChange={(v) => onChange('rise', v)}
          />
          <SmallField
            label="Fall"
            value={(metadata.fall as string) ?? '1u'}
            onChange={(v) => onChange('fall', v)}
          />
          <SmallField
            label="Width"
            value={(metadata.width as string) ?? '0.5m'}
            onChange={(v) => onChange('width', v)}
          />
          <SmallField
            label="Period"
            value={(metadata.period as string) ?? '1m'}
            onChange={(v) => onChange('period', v)}
          />
        </>
      )}
    </div>
  )
}

function SmallField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const fieldId = `prop-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={fieldId} className="text-gray-500 font-medium text-[10px]">
        {label}
      </label>
      <input
        id={fieldId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 text-[11px]"
      />
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
