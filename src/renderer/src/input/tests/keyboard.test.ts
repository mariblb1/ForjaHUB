import { describe, expect, it } from 'vitest'
import { mapKeyToIntent } from '../keyboard'

describe('mapKeyToIntent — teclas mapeadas', () => {
  const table: Array<[string, ReturnType<typeof mapKeyToIntent>]> = [
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['Enter', 'confirm'],
    ['Escape', 'back']
  ]

  it.each(table)('%s -> %s', (key, intent) => {
    expect(mapKeyToIntent({ key, repeat: false })).toBe(intent)
  })
})

describe('mapKeyToIntent — auto-repeat do SO', () => {
  it('repeat:true é ignorado mesmo numa tecla mapeada', () => {
    expect(mapKeyToIntent({ key: 'ArrowRight', repeat: true })).toBeNull()
  })
})

describe('mapKeyToIntent — teclas fora do mapa', () => {
  it('tecla não mapeada devolve null', () => {
    expect(mapKeyToIntent({ key: 'a', repeat: false })).toBeNull()
  })
})
