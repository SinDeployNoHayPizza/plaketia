import { applyImportToCircuit, importNetlist } from '@/features/circuit/io/spiceNetlist.ts'
import { Circuit } from '@/features/circuit/model/Circuit.ts'
import { useCircuitStore } from '@/features/circuit/store.ts'
import { useSchematicStore } from '@/features/schematic/store.ts'
import { Button } from '@/shared/ui/Button.tsx'
import { Dialog } from '@/shared/ui/Dialog.tsx'
import { useState } from 'react'

interface ProjectEntry {
  id: string
  name: string
  description: string
  modified: string
}

const STORAGE_KEY = 'plaketia-projects'

function loadProjects(): ProjectEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ProjectEntry[]
  } catch {
    return []
  }
}

function saveProjects(projects: ProjectEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

interface ProjectManagerScreenProps {
  onOpenProject?: (id: string) => void
}

function EmptyState({ onNewDesign }: { onNewDesign: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5 max-w-xs text-center">
        <svg
          viewBox="0 0 200 140"
          className="w-48 h-auto text-copper/70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M40 70 L65 70 L100 40 L110 40"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            className="trace-path"
          />
          <path
            d="M40 70 L65 70 L100 100 L150 100"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            className="trace-path"
            style={{ animationDelay: '0.6s' }}
          />
          <path
            d="M110 40 L110 100"
            stroke="currentColor"
            strokeWidth="2"
            className="trace-path"
            style={{ animationDelay: '0.3s' }}
          />
          <circle cx="40" cy="70" r="10" stroke="currentColor" strokeWidth="2" />
          <circle cx="40" cy="70" r="4" fill="currentColor" opacity="0.4" />
          <rect
            x="100"
            y="30"
            width="20"
            height="80"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect x="104" y="34" width="12" height="72" rx="1.5" fill="currentColor" opacity="0.08" />
          <circle cx="150" cy="100" r="8" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="150" cy="100" r="3" fill="currentColor" opacity="0.3" />
        </svg>

        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-text-primary">
            Your workbench is empty
          </h2>
          <p className="font-body text-sm text-text-secondary mt-1.5 leading-relaxed">
            Start a new design to place your first component and run your first simulation.
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={onNewDesign}>
          + New design
        </Button>
      </div>
    </div>
  )
}

export function ProjectManagerScreen({ onOpenProject }: ProjectManagerScreenProps) {
  const [projects, setProjects] = useState<ProjectEntry[]>(loadProjects)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importText, setImportText] = useState('')
  const [importErrors, setImportErrors] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const createCircuit = useCircuitStore((s) => s.createCircuit)
  const loadCircuit = useCircuitStore((s) => s.loadCircuit)

  function handleCreate() {
    if (!newName.trim()) return

    const id = `proj-${Date.now()}`
    const now = new Date().toISOString()
    const entry: ProjectEntry = {
      id,
      name: newName.trim(),
      description: newDescription.trim(),
      modified: now,
    }

    const next = [entry, ...projects]
    setProjects(next)
    saveProjects(next)

    useSchematicStore.getState().reset()
    createCircuit(id, entry.name)

    setNewName('')
    setNewDescription('')
    setShowNewDialog(false)
    onOpenProject?.(id)
  }

  function handleDelete(id: string) {
    const next = projects.filter((p) => p.id !== id)
    setProjects(next)
    saveProjects(next)
  }

  function handleOpen(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    useSchematicStore.getState().reset()
    createCircuit(id, project.name)
    onOpenProject?.(id)
  }

  function handleImport() {
    if (!importText.trim()) return

    const result = importNetlist(importText)
    if (result.errors.length > 0) {
      setImportErrors(result.errors.join('\n'))
      return
    }

    const id = `proj-${Date.now()}`
    const now = new Date().toISOString()
    const entry: ProjectEntry = {
      id,
      name: result.title,
      description: 'Imported from SPICE netlist',
      modified: now,
    }

    const next = [entry, ...projects]
    setProjects(next)
    saveProjects(next)

    const circuit = new Circuit(id, result.title)
    const components = applyImportToCircuit(circuit, result)
    loadCircuit(circuit, components)

    useSchematicStore.getState().clear()

    let idx = 0
    for (const [compId, comp] of components) {
      const pos = { x: 100 + (idx % 5) * 160, y: 100 + Math.floor(idx / 5) * 120 }
      useSchematicStore
        .getState()
        .addImportedComponentNode(compId, comp.type, comp.reference, comp.value, comp.model, pos)
      idx++
    }

    setImportText('')
    setImportErrors('')
    setShowImportDialog(false)
    onOpenProject?.(id)
  }

  return (
    <div className="flex flex-col h-full bg-substrate">
      <header className="flex items-center justify-between px-6 py-4 bg-silk border-b border-trace shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-[0.08em] text-text-primary">
            Plaketia
          </h1>
          <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden="true" />
          <p className="font-body text-sm text-text-secondary hidden sm:block">
            Analog Electronics Design &amp; Analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" onClick={() => setShowImportDialog(true)}>
            Import SPICE
          </Button>
          <Button variant="primary" size="lg" onClick={() => setShowNewDialog(true)}>
            + New design
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <EmptyState onNewDesign={() => setShowNewDialog(true)} />
        ) : (
          <div className="max-w-xl mx-auto w-full px-6 py-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display text-sm font-semibold tracking-wide text-text-secondary">
                {projects.length} {projects.length === 1 ? 'design' : 'designs'}
              </span>
              <span className="flex-1 h-px bg-trace/50" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-silk rounded-sm border-l-[3px] border-trace hover:border-copper transition-all duration-150 cursor-pointer"
                  onClick={() => handleOpen(project.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpen(project.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base font-bold tracking-wide text-text-primary truncate">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="font-body text-sm text-text-secondary mt-0.5 line-clamp-1">
                            {project.description}
                          </p>
                        )}
                        <p className="font-mono text-xs text-text-secondary/60 mt-1.5">
                          {new Date(project.modified).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpen(project.id)
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(project.id)
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        title="New design"
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create design
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="project-name-input"
              className="block font-body text-sm font-medium text-text-primary mb-1"
            >
              Design name
            </label>
            <input
              id="project-name-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 bg-substrate/50 border border-trace rounded-sm font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-copper focus:bg-substrate/70 transition-colors"
              placeholder="e.g. Differential Amplifier"
            />
          </div>
          <div>
            <label
              htmlFor="project-desc-input"
              className="block font-body text-sm font-medium text-text-primary mb-1"
            >
              Description
            </label>
            <textarea
              id="project-desc-input"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 bg-substrate/50 border border-trace rounded-sm font-body text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-copper focus:bg-substrate/70 transition-colors resize-none"
              placeholder="Optional description..."
              rows={3}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showImportDialog}
        onClose={() => {
          setShowImportDialog(false)
          setImportErrors('')
        }}
        title="Import SPICE Netlist"
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowImportDialog(false)
                setImportErrors('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importText.trim()}>
              Import
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="font-body text-xs text-text-secondary leading-relaxed">
            Paste a SPICE netlist to create a new design. Supports R, C, L, D, Q, M, J, V, I
            devices, .model/.subckt, line continuation, and analysis directives.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-48 px-3 py-2 bg-substrate/50 border border-trace rounded-sm font-mono text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-copper focus:bg-substrate/70 transition-colors resize-none"
            placeholder={'* Voltage Divider\nR1 N001 N002 10k\nR2 N002 0 2.2k\n.end'}
            spellCheck={false}
          />
          {importErrors && (
            <div className="font-mono text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2 whitespace-pre-wrap">
              {importErrors}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  )
}
