import { describe, expect, it } from 'vitest'
import { matchOperatorShortcut } from './shortcuts'

type Chord = Parameters<typeof matchOperatorShortcut>[0]

const chord = (over: Partial<Chord> = {}): Chord => ({
  type: 'keyDown',
  shift: true,
  control: true,
  meta: false,
  alt: false,
  isAutoRepeat: false,
  key: 'q',
  ...over
})

describe('matchOperatorShortcut', () => {
  it('casa os 3 chords do Operador (case-insensitive)', () => {
    expect(matchOperatorShortcut(chord({ key: 'q' }))).toBe('quit')
    expect(matchOperatorShortcut(chord({ key: 'M' }))).toBe('toggle-fullscreen')
    expect(matchOperatorShortcut(chord({ key: 'o' }))).toBe('open-operator')
  })

  it('aceita meta no lugar de control (macOS)', () => {
    expect(matchOperatorShortcut(chord({ control: false, meta: true }))).toBe('quit')
  })

  it('rejeita quando falta shift ou control/meta', () => {
    expect(matchOperatorShortcut(chord({ shift: false }))).toBeNull()
    expect(matchOperatorShortcut(chord({ control: false, meta: false }))).toBeNull()
  })

  it('rejeita alt junto (evita quit acidental) e teclas fora do set', () => {
    expect(matchOperatorShortcut(chord({ alt: true }))).toBeNull()
    expect(matchOperatorShortcut(chord({ key: 'x' }))).toBeNull()
  })

  it('rejeita keyUp e auto-repeat', () => {
    expect(matchOperatorShortcut(chord({ type: 'keyUp' }))).toBeNull()
    expect(matchOperatorShortcut(chord({ isAutoRepeat: true }))).toBeNull()
  })
})
