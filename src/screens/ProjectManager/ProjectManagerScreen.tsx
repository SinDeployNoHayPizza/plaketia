import { useCircuitStore } from '@/features/circuit/store.ts'
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

export function ProjectManagerScreen() {
  const [projects, setProjects] = useState<ProjectEntry[]>(loadProjects)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const createCircuit = useCircuitStore((s) => s.createCircuit)

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

    createCircuit(id, entry.name)

    setNewName('')
    setNewDescription('')
    setShowNewDialog(false)
  }

  function handleDelete(id: string) {
    const next = projects.filter((p) => p.id !== id)
    setProjects(next)
    saveProjects(next)
  }

  function handleOpen(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    createCircuit(id, project.name)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plaketia</h1>
          <p className="text-sm text-gray-500">Analog Electronics Design & Analysis</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} variant="primary" size="lg">
          + New Project
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <span className="text-5xl">⚡</span>
            <p className="text-lg">No projects yet</p>
            <p className="text-sm">Create your first project to start designing circuits</p>
          </div>
        ) : (
          <div className="grid gap-3 max-w-2xl">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => handleOpen(project.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleOpen(project.id)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Modified: {new Date(project.modified).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(project.id)
                  }}
                  className="text-gray-400 hover:text-red-500 text-sm px-2 py-1"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        title="New Project"
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="project-name-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Name
            </label>
            <input
              id="project-name-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Circuit"
            />
          </div>
          <div>
            <label
              htmlFor="project-desc-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="project-desc-input"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Optional description..."
              rows={3}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
