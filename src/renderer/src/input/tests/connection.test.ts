import { describe, expect, it } from 'vitest'
import { shouldWarnDisconnected } from '../connection'

describe('shouldWarnDisconnected', () => {
  it('boot sem nenhum Controle plugado: silencioso', () => {
    expect(shouldWarnDisconnected(false, false)).toBe(false)
  })

  it('conectado: sem aviso', () => {
    expect(shouldWarnDisconnected(true, true)).toBe(false)
  })

  it('desconectou depois de já ter conectado: mostra o aviso', () => {
    expect(shouldWarnDisconnected(true, false)).toBe(true)
  })

  it('reconectou: aviso some', () => {
    expect(shouldWarnDisconnected(true, true)).toBe(false)
  })
})
