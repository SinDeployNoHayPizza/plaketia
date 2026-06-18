import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[3D Error]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-red-500 p-4 text-sm font-mono">
          <div className="max-w-md">
            <div className="font-bold mb-2">3D Viewer Error</div>
            <pre className="whitespace-pre-wrap text-xs opacity-80">
              {this.state.error?.message}
            </pre>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
