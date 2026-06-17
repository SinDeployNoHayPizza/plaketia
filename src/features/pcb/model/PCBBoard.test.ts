import { describe, expect, it } from 'vitest'
import { PCBBoard } from './PCBBoard.ts'

describe('PCBBoard', () => {
  it('creates a default board', () => {
    const board = new PCBBoard()
    expect(board.width).toBe(100)
    expect(board.height).toBe(80)
    expect(board.thickness).toBe(1.6)
    expect(board.material).toBe('FR4')
    expect(board.tracks).toHaveLength(0)
    expect(board.vias).toHaveLength(0)
    expect(board.placedComponents).toHaveLength(0)
    expect(board.boardOutline).toHaveLength(4)
    expect(board.metadata.name).toBe('Untitled PCB')
  })

  it('creates board with custom dimensions', () => {
    const board = new PCBBoard({ width: 50, height: 40 })
    expect(board.width).toBe(50)
    expect(board.height).toBe(40)
  })

  it('adds and removes tracks', () => {
    const board = new PCBBoard()
    const track = board.addTrack(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      'top',
      0.5,
      'N001',
    )
    expect(board.tracks).toHaveLength(1)
    expect(track.id).toMatch(/^T\d+$/)
    expect(track.layer).toBe('top')
    expect(track.width).toBe(0.5)
    expect(track.netId).toBe('N001')

    board.removeTrack(track.id)
    expect(board.tracks).toHaveLength(0)
  })

  it('adds and removes vias', () => {
    const board = new PCBBoard()
    const via = board.addVia({ x: 5, y: 5 }, 0.3, 0.6, 'N001')
    expect(board.vias).toHaveLength(1)
    expect(via.id).toMatch(/^V\d+$/)
    expect(via.drillDiameter).toBe(0.3)
    expect(via.outerDiameter).toBe(0.6)

    board.removeVia(via.id)
    expect(board.vias).toHaveLength(0)
  })

  it('places and removes components', () => {
    const board = new PCBBoard()
    board.placeComponent({
      componentId: 'r1',
      reference: 'R1',
      type: 'resistor',
      footprintName: 'axial-resistor',
      position: { x: 10, y: 10 },
      rotation: 0,
      side: 'top',
      locked: false,
    })
    expect(board.placedComponents).toHaveLength(1)
    expect(board.placedComponents[0].reference).toBe('R1')

    board.placeComponent({
      componentId: 'c1',
      reference: 'C1',
      type: 'capacitor',
      footprintName: 'radial-capacitor',
      position: { x: 20, y: 20 },
      rotation: 0,
      side: 'top',
      locked: false,
    })
    expect(board.placedComponents).toHaveLength(2)

    board.removeComponent('r1')
    expect(board.placedComponents).toHaveLength(1)
    expect(board.placedComponents[0].componentId).toBe('c1')
  })

  it('upserts component on re-place', () => {
    const board = new PCBBoard()
    board.placeComponent({
      componentId: 'r1',
      reference: 'R1',
      footprintName: 'axial-resistor',
      position: { x: 10, y: 10 },
      rotation: 0,
      side: 'top',
      locked: false,
    })
    board.placeComponent({
      componentId: 'r1',
      reference: 'R1',
      footprintName: 'axial-resistor',
      position: { x: 20, y: 20 },
      rotation: 90,
      side: 'top',
      locked: true,
    })
    expect(board.placedComponents).toHaveLength(1)
    expect(board.placedComponents[0].position.x).toBe(20)
    expect(board.placedComponents[0].rotation).toBe(90)
    expect(board.placedComponents[0].locked).toBe(true)
  })

  it('gets tracks for a net', () => {
    const board = new PCBBoard()
    board.addTrack(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      'top',
      0.5,
      'N001',
    )
    board.addTrack(
      [
        { x: 0, y: 5 },
        { x: 10, y: 5 },
      ],
      'top',
      0.5,
      'N002',
    )
    board.addTrack(
      [
        { x: 5, y: 0 },
        { x: 5, y: 10 },
      ],
      'top',
      0.5,
      'N001',
    )

    expect(board.getTracksForNet('N001')).toHaveLength(2)
    expect(board.getTracksForNet('N002')).toHaveLength(1)
    expect(board.getTracksForNet('N003')).toHaveLength(0)
  })

  it('serializes and deserializes via toJSON/fromJSON', () => {
    const board = new PCBBoard({ width: 50, height: 30 })
    board.addTrack(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      'top',
      0.5,
      'N001',
    )
    board.addVia({ x: 5, y: 5 }, 0.3, 0.6, 'N001')
    board.placeComponent({
      componentId: 'r1',
      reference: 'R1',
      footprintName: 'axial-resistor',
      position: { x: 10, y: 10 },
      rotation: 0,
      side: 'top',
      locked: false,
    })

    const json = board.toJSON()
    expect(json.width).toBe(50)
    expect(json.height).toBe(30)
    expect(json.tracks).toHaveLength(1)
    expect(json.vias).toHaveLength(1)
    expect(json.placedComponents).toHaveLength(1)

    const restored = PCBBoard.fromJSON(json)
    expect(restored.width).toBe(50)
    expect(restored.tracks).toHaveLength(1)
    expect(restored.tracks[0].id).toBe(board.tracks[0].id)
    expect(restored.vias[0].id).toBe(board.vias[0].id)
  })
})

describe('DRC', () => {
  it('detects min-width violation', () => {
    const board = new PCBBoard()
    board.designRules = { minTraceWidth: 0.5 }
    board.addTrack(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      'top',
      0.25,
      'N001',
    )
    const violations = board.runDRC()
    expect(violations.some((v) => v.type === 'min-width')).toBe(true)
  })

  it('detects drill-size violation', () => {
    const board = new PCBBoard()
    board.designRules = { minDrillDiameter: 0.5 }
    board.addVia({ x: 5, y: 5 }, 0.3, 0.6, 'N001')
    const violations = board.runDRC()
    expect(violations.some((v) => v.type === 'drill-size')).toBe(true)
  })

  it('detects annular-ring violation', () => {
    const board = new PCBBoard()
    board.designRules = { minAnnularRing: 0.2 }
    board.addVia({ x: 5, y: 5 }, 0.6, 0.7, 'N001')
    const violations = board.runDRC()
    expect(violations.some((v) => v.type === 'annular-ring')).toBe(true)
  })

  it('detects track-track clearance violation', () => {
    const board = new PCBBoard()
    board.designRules = { minClearance: 0.5 }
    board.addTrack(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      'top',
      0.2,
      'N001',
    )
    board.addTrack(
      [
        { x: 0, y: 0.3 },
        { x: 10, y: 0.3 },
      ],
      'top',
      0.2,
      'N002',
    )
    const violations = board.runDRC()
    expect(violations.some((v) => v.type === 'clearance')).toBe(true)
  })

  it('detects board-edge violation for tracks', () => {
    const board = new PCBBoard({ width: 10, height: 10 })
    board.designRules = { minClearance: 1 }
    board.addTrack(
      [
        { x: 0, y: 5 },
        { x: 5, y: 5 },
      ],
      'top',
      0.2,
      'N001',
    )
    const violations = board.runDRC()
    expect(violations.some((v) => v.type === 'board-edge')).toBe(true)
  })

  it('reports clean board with no violations', () => {
    const board = new PCBBoard({ width: 20, height: 20 })
    board.addTrack(
      [
        { x: 2, y: 2 },
        { x: 18, y: 2 },
      ],
      'top',
      0.5,
      'N001',
    )
    board.addTrack(
      [
        { x: 2, y: 10 },
        { x: 18, y: 10 },
      ],
      'top',
      0.5,
      'N002',
    )
    board.addVia({ x: 5, y: 5 }, 0.3, 0.8, 'N001')
    const violations = board.runDRC()
    expect(violations.filter((v) => v.severity === 'error')).toHaveLength(0)
  })
})
