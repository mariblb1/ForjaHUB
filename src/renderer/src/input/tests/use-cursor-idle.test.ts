import { describe, expect, it } from 'vitest'
import { isCursorVisible } from '../hooks/use-cursor-idle'

describe('isCursorVisible', () => {
  it('logo após mover, visível', () => {
    expect(isCursorVisible(0)).toBe(true)
  })

  it('pouco antes dos 3s, ainda visível', () => {
    expect(isCursorVisible(2999)).toBe(true)
  })

  it('aos 3s parado (ou mais), escondido', () => {
    expect(isCursorVisible(3000)).toBe(false)
    expect(isCursorVisible(5000)).toBe(false)
  })
})
