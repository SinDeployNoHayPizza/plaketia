import { useEffect, useRef } from 'react'
import type { SimulationResult } from '../types.ts'

export function OscilloscopePanel({ result }: { result: SimulationResult | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<ReturnType<typeof Plotly.react> | null>(null)

  useEffect(() => {
    if (!result || result.waveforms.length === 0 || !containerRef.current) return

    async function draw() {
      const Plotly = await import('plotly.js-dist-min')

      const traces = result.waveforms.map((wf) => ({
        x: wf.data.map((p) => p.time),
        y: wf.data.map((p) => p.value),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: wf.label,
        line: { width: 1.5 },
      }))

      const layout: Partial<Plotly.Layout> = {
        title: { text: 'Transient Analysis', font: { size: 12 } },
        xaxis: {
          title: { text: 'Time (s)', font: { size: 10 } },
          showgrid: true,
          gridcolor: '#e5e7eb',
          zerolinecolor: '#d1d5db',
        },
        yaxis: {
          title: { text: 'Voltage (V)', font: { size: 10 } },
          showgrid: true,
          gridcolor: '#e5e7eb',
          zerolinecolor: '#d1d5db',
        },
        margin: { l: 40, r: 20, t: 30, b: 40 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { family: 'ui-monospace, monospace', size: 10 },
        legend: { font: { size: 9 }, orientation: 'h', y: 1.1 },
        autosize: true,
      }

      const config: Partial<Plotly.Config> = {
        responsive: true,
        displayModeBar: false,
        scrollZoom: true,
      }

      plotRef.current = Plotly.react(containerRef.current!, traces, layout, config)
    }

    draw()
  }, [result])

  if (!result || result.waveforms.length === 0) return null

  return (
    <div className="w-full h-64">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
