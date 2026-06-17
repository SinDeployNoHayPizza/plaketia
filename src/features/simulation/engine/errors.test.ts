import { describe, expect, it } from 'vitest'
import { analyzeSpiceError, formatSimulationError } from './errors.ts'

describe('analyzeSpiceError', () => {
  it.each([
    {
      name: 'singular matrix',
      stdout: 'Error: singular matrix in dc analysis',
      stderr: '',
      expectedSuggestion: 'floating',
    },
    {
      name: 'no convergence',
      stdout: 'Warning: no convergence in dc iteration',
      stderr: '',
      expectedSuggestion: 'converge',
    },
    {
      name: 'time step too small',
      stdout: 'Error: time step too small',
      stderr: '',
      expectedSuggestion: 'time step',
    },
    {
      name: 'model not found',
      stdout: 'Error: no such model 2n3904',
      stderr: '',
      expectedSuggestion: 'model name',
    },
    {
      name: 'voltage source loop',
      stdout: 'Error: voltage source loop',
      stderr: '',
      expectedSuggestion: 'loop',
    },
    {
      name: 'floating node',
      stdout: 'Error: zero diagonal',
      stderr: '',
      expectedSuggestion: 'ground',
    },
  ])('detects $name error', ({ stdout, expectedSuggestion }) => {
    const result = analyzeSpiceError(stdout, '')
    expect(result).not.toBeNull()
    expect(result!.suggestion.toLowerCase()).toContain(expectedSuggestion)
  })

  it('returns null for clean output', () => {
    const result = analyzeSpiceError('Circuit: done', '')
    expect(result).toBeNull()
  })

  it('checks both stdout and stderr', () => {
    const result = analyzeSpiceError('', 'stderr: singular matrix in dc')
    expect(result).not.toBeNull()
  })
})

describe('formatSimulationError', () => {
  it('uses analyzed error when available', () => {
    const msg = formatSimulationError('Error: singular matrix', '', [])
    expect(msg).toContain('fix')
    expect(msg).toContain('floating')
  })

  it('falls back to last messages when no spice error', () => {
    const msg = formatSimulationError('Ok', '', ['line 1', 'line 2', 'line 3'])
    expect(msg).toBe('line 1\nline 2\nline 3')
  })

  it('returns generic message when nothing available', () => {
    const msg = formatSimulationError('', '', [])
    expect(msg).toContain('no specific error')
  })
})
