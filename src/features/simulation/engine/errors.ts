interface SpiceError {
  message: string
  suggestion: string
}

const errorPatterns: Array<{ pattern: RegExp; suggestion: string }> = [
  {
    pattern: /singular\s*matrix/i,
    suggestion:
      'The circuit matrix is singular. Check for floating nodes — every node needs a DC path to ground.',
  },
  {
    pattern: /no\s*convergence|convergence\s*failure|iteration\s*limit/i,
    suggestion:
      'DC solver failed to converge. Check component biasing, add initial conditions, or verify feedback loops.',
  },
  {
    pattern: /time\s*step\s*too\s*small/i,
    suggestion:
      'Time step became too small during transient analysis. Try reducing max step or adding damping (series R) to inductive/capacitive loops.',
  },
  {
    pattern: /no\s*such\s*model|model\s*not\s*found/i,
    suggestion:
      'A SPICE model name is not recognized. Check the model field in your component properties.',
  },
  {
    pattern: /missing\s*model/i,
    suggestion:
      'A component requires a .model card that is not defined. Add a model definition or use a built-in model.',
  },
  {
    pattern: /voltage\s*source.*loop|loop\s*of\s*voltage/i,
    suggestion:
      'Voltage sources form a loop. Each mesh must contain at least one non-voltage-source element (R, C, etc.).',
  },
  {
    pattern: /zero\s*diagonal|floating\s*node/i,
    suggestion:
      'A node has no DC path to ground. Make sure all nodes connect to GND through at least one component.',
  },
  {
    pattern: /internal\s*error|segmentation\s*fault|stack.*smash/i,
    suggestion:
      'ngspice encountered an internal error. Try simplifying the circuit or reducing simulation complexity.',
  },
]

export function analyzeSpiceError(stdout: string, stderr: string): SpiceError | null {
  const combined = `${stdout}\n${stderr}`

  for (const { pattern, suggestion } of errorPatterns) {
    if (pattern.test(combined)) {
      const match = combined.match(pattern)
      const message = match ? match[0].trim() : pattern.source
      return { message: message.length > 120 ? `${message.slice(0, 120)}...` : message, suggestion }
    }
  }

  return null
}

export function formatSimulationError(stdout: string, stderr: string, messages: string[]): string {
  const spiceErr = analyzeSpiceError(stdout, stderr)
  if (spiceErr) {
    return `${spiceErr.message}\n\nSuggested fix: ${spiceErr.suggestion}`
  }

  const lastMessages = messages.filter(Boolean).slice(-5)
  if (lastMessages.length > 0) {
    return lastMessages.join('\n')
  }

  return 'Simulation failed with no specific error message. Check the circuit connections.'
}
