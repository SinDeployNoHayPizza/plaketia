import { describe, expect, it } from 'vitest'
import { PCBBoard } from '../model/PCBBoard.ts'
import { exportGerber } from './gerber.ts'

describe('Gerber export', () => {
  it('exports a basic board', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    const output = exportGerber(board.toJSON())
    expect(output.topCopper).toContain('%FSLAX44Y44*%')
    expect(output.topCopper).toContain('%MOMM*%')
    expect(output.topCopper).toContain('M02*')
    expect(output.bottomCopper).toContain('M02*')
    expect(output.topSilkscreen).toContain('M02*')
    expect(output.outline).toContain('M02*')
    expect(output.drill).toContain('M48')
    expect(output.drill).toContain('M30')
  })

  it('includes tracks in top copper', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    board.addTrack(
      [
        { x: 5, y: 5 },
        { x: 15, y: 5 },
      ],
      'top',
      0.5,
      'N001',
    )
    const output = exportGerber(board.toJSON())
    expect(output.topCopper).toContain('D01*')
  })

  it('includes tracks in bottom copper', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    board.addTrack(
      [
        { x: 5, y: 5 },
        { x: 15, y: 5 },
      ],
      'bottom',
      0.5,
      'N001',
    )
    const output = exportGerber(board.toJSON())
    expect(output.bottomCopper).toContain('D01*')
  })

  it('excludes bottom tracks from top copper', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    board.addTrack(
      [
        { x: 5, y: 5 },
        { x: 15, y: 5 },
      ],
      'bottom',
      0.5,
      'N001',
    )
    const output = exportGerber(board.toJSON())
    expect(output.topCopper).not.toContain('D01*')
  })

  it('includes vias in top and bottom copper', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    board.addVia({ x: 10, y: 10 }, 0.3, 0.6, 'N001')
    const output = exportGerber(board.toJSON())
    expect(output.topCopper).toContain('D03*')
    expect(output.bottomCopper).toContain('D03*')
  })

  it('includes component pads in copper', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    board.placeComponent({
      componentId: 'r1',
      reference: 'R1',
      footprintName: 'axial-resistor',
      position: { x: 10, y: 10 },
      rotation: 0,
      side: 'top',
      locked: false,
    })
    const output = exportGerber(board.toJSON())
    expect(output.topCopper).toContain('D03*')
  })

  it('generates drill file with holes', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    board.addVia({ x: 10, y: 10 }, 0.3, 0.6, 'N001')
    board.placeComponent({
      componentId: 'r1',
      reference: 'R1',
      footprintName: 'axial-resistor',
      position: { x: 20, y: 20 },
      rotation: 0,
      side: 'top',
      locked: false,
    })
    const output = exportGerber(board.toJSON())
    expect(output.drill).toContain('T1')
    expect(output.drill).toContain('T2')
  })

  it('generates silkscreen for components', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    board.placeComponent({
      componentId: 'r1',
      reference: 'R1',
      footprintName: 'axial-resistor',
      position: { x: 10, y: 10 },
      rotation: 0,
      side: 'top',
      locked: false,
    })
    const output = exportGerber(board.toJSON())
    expect(output.topSilkscreen).toContain('D01*')
  })

  it('generates outline', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    const output = exportGerber(board.toJSON())
    expect(output.outline).toContain('D01*')
    expect(output.outline).toContain('D02*')
  })
})
