import { describe, expect, it } from 'vitest'
import { moveFocus } from '../focus'

describe('moveFocus — right', () => {
  it('avança um índice', () => {
    expect(moveFocus(0, 5, 'right')).toBe(1)
  })

  it('do último item, dá wrap pro primeiro', () => {
    expect(moveFocus(4, 5, 'right')).toBe(0)
  })
})

describe('moveFocus — left', () => {
  it('recua um índice', () => {
    expect(moveFocus(2, 5, 'left')).toBe(1)
  })

  it('do primeiro item, dá wrap pro último', () => {
    expect(moveFocus(0, 5, 'left')).toBe(4)
  })
})

describe('moveFocus — intents sem efeito no harness 1D', () => {
  it.each(['up', 'down', 'confirm', 'back'] as const)('%s mantém o índice atual', (intent) => {
    expect(moveFocus(2, 5, intent)).toBe(2)
  })
})

describe('moveFocus — lista vazia', () => {
  it('count 0 devolve o índice recebido sem dividir por zero', () => {
    expect(moveFocus(0, 0, 'right')).toBe(0)
  })
})

describe('moveFocus — robustez fora do intervalo [0, count)', () => {
  it('current negativo (fora do uso normal, defensivo) volta pro intervalo válido', () => {
    expect(moveFocus(-10, 5, 'right')).toBe(1)
  })

  it('current maior que count (fora do uso normal, defensivo) volta pro intervalo válido', () => {
    expect(moveFocus(12, 5, 'left')).toBe(1)
  })
})
