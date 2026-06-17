import {
  Background,
  Controls,
  MiniMap,
  type Node,
  type NodeMouseHandler,
  ReactFlow,
  SelectionMode,
  type XYPosition,
} from '@xyflow/react'
import { useCallback, useRef } from 'react'
import '@xyflow/react/dist/style.css'
import { WireEdge } from '@/features/schematic/edges/WireEdge.tsx'
import { ComponentNode } from '@/features/schematic/nodes/ComponentNode.tsx'
import { GroundNode } from '@/features/schematic/nodes/GroundNode.tsx'
import { PropertiesPanel } from '@/features/schematic/properties/PropertiesPanel.tsx'
import { useSchematicStore } from '@/features/schematic/store.ts'
import { ComponentPalette } from '@/features/schematic/toolbar/ComponentPalette.tsx'

const nodeTypes = {
  component: ComponentNode,
  ground: GroundNode,
}

const edgeTypes = {
  wire: WireEdge,
}

export function SchematicEditorScreen() {
  const nodes = useSchematicStore((s) => s.nodes)
  const edges = useSchematicStore((s) => s.edges)
  const onNodesChange = useSchematicStore((s) => s.onNodesChange)
  const onEdgesChange = useSchematicStore((s) => s.onEdgesChange)
  const onConnect = useSchematicStore((s) => s.onConnect)
  const addComponentAtPosition = useSchematicStore((s) => s.addComponentAtPosition)
  const addGroundAtPosition = useSchematicStore((s) => s.addGroundAtPosition)
  const removeNodeAndEdges = useSchematicStore((s) => s.removeNodeAndEdges)
  const selectedNodeId = useSchematicStore((s) => s.selectedNodeId)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const wrapper = reactFlowWrapper.current
      if (!wrapper) return

      const bounds = wrapper.getBoundingClientRect()
      const position: XYPosition = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }

      if (type === 'ground') {
        addGroundAtPosition(position)
      } else {
        addComponentAtPosition(type, position)
      }
    },
    [addComponentAtPosition, addGroundAtPosition],
  )

  const onNodeClick: NodeMouseHandler = useCallback((_event: React.MouseEvent, node: Node) => {
    useSchematicStore.setState({ selectedNodeId: node.id })
  }, [])

  const onPaneClick = useCallback(() => {
    useSchematicStore.setState({ selectedNodeId: null })
  }, [])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          removeNodeAndEdges(selectedNodeId)
        }
      }
    },
    [selectedNodeId, removeNodeAndEdges],
  )

  return (
    <div className="flex h-full w-full bg-substrate" onKeyDown={onKeyDown}>
      <div className="w-44 border-r border-trace bg-silk overflow-y-auto shrink-0">
        <div className="px-3 py-2 border-b border-trace font-display text-sm font-bold tracking-wide text-text-primary">
          Components
        </div>
        <ComponentPalette />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode="loose"
            selectionMode={SelectionMode.Partial}
            fitView
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            snapToGrid
            snapGrid={[10, 10]}
          >
            <Background gap={20} size={1} color="#C9BCA6" />
            <Controls showInteractive={false} />
            <MiniMap
              style={{ width: 120, height: 80 }}
              nodeColor="#C87A3E"
              maskColor="rgba(0,0,0,0.08)"
            />
          </ReactFlow>
        </div>
      </div>

      <div className="w-52 border-l border-trace bg-silk overflow-y-auto shrink-0">
        <div className="px-3 py-2 border-b border-trace font-display text-sm font-bold tracking-wide text-text-primary">
          Properties
        </div>
        <PropertiesPanel />
      </div>
    </div>
  )
}
