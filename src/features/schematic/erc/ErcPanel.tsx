import { useCircuitStore } from '@/features/circuit/store.ts'
import { type ErcResult, runErc } from '@/features/circuit/validation/erc.ts'
import { useCallback, useState } from 'react'

export function ErcPanel() {
  const [result, setResult] = useState<ErcResult | null>(null)

  const handleRun = useCallback(() => {
    const state = useCircuitStore.getState()
    const circuit = state.circuit
    if (!circuit) return
    const res = runErc(circuit, state.components)
    setResult(res)
  }, [])

  return (
    <div className="flex flex-col">
      <div className="px-3 py-2 border-b border-trace flex items-center justify-between">
        <span className="font-body text-xs font-medium text-text-secondary">ERC</span>
        <button
          type="button"
          onClick={handleRun}
          className="font-body text-xs text-copper hover:text-copper-dark font-medium transition-colors"
        >
          Run check
        </button>
      </div>

      {result && (
        <div className="px-3 py-2 space-y-1 max-h-60 overflow-y-auto">
          {result.errorCount > 0 && (
            <div className="font-body text-xs font-medium text-red-600 mb-1">
              {result.errorCount} error{result.errorCount > 1 ? 's' : ''}
            </div>
          )}
          {result.warningCount > 0 && (
            <div className="font-body text-xs font-medium text-amber-600 mb-1">
              {result.warningCount} warning{result.warningCount > 1 ? 's' : ''}
            </div>
          )}
          {result.valid && result.warningCount === 0 && (
            <div className="font-body text-xs text-mask">No issues found</div>
          )}
          {result.issues.map((issue) => (
            <div
              key={`${issue.code}-${issue.componentId ?? ''}-${issue.pinIndex ?? ''}`}
              className={`font-mono text-[10px] leading-tight py-0.5 ${
                issue.type === 'error' ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              <span className="font-semibold">{issue.code}</span>
              {' — '}
              {issue.message}
            </div>
          ))}
        </div>
      )}

      {!result && (
        <div className="px-3 py-4 text-center font-body text-xs text-text-secondary">
          Run an ERC check to validate your circuit
        </div>
      )}
    </div>
  )
}
