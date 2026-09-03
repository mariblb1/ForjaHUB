import { describe, expect, it } from 'vitest'
import type { KioskState, Mode } from '@shared/types'
import { initialState, reducer, type Action } from './reducer'

const base: KioskState = { mode: 'catalog', errorPlate: 'ALGO', controllerConnected: true }

describe('initialState', () => {
  it('começa em boot, sem placa de erro e sem controle', () => {
    expect(initialState).toEqual({ mode: 'boot', errorPlate: null, controllerConnected: false })
  })
})

describe('reducer — set-mode', () => {
  it('troca o mode preservando errorPlate e controllerConnected', () => {
    const next = reducer(base, { type: 'set-mode', mode: 'operator' })
    expect(next).toEqual({ mode: 'operator', errorPlate: 'ALGO', controllerConnected: true })
  })

  it('mode igual ao atual é no-op (mesma referência)', () => {
    const next = reducer(base, { type: 'set-mode', mode: 'catalog' })
    expect(next).toBe(base)
  })

  it('mode fora do union deixa o estado inalterado (mesma referência)', () => {
    const next = reducer(base, { type: 'set-mode', mode: 'bogus' as Mode })
    expect(next).toBe(base)
  })
})

describe('reducer — error-plate / controller não mexem no mode', () => {
  it('error-plate seta o código sem trocar o mode', () => {
    const next = reducer(base, { type: 'error-plate', code: 'EXE_FALHOU' })
    expect(next).toEqual({ mode: 'catalog', errorPlate: 'EXE_FALHOU', controllerConnected: true })
  })

  it('error-plate com null limpa a placa sem trocar o mode', () => {
    const next = reducer(base, { type: 'error-plate', code: null })
    expect(next).toEqual({ mode: 'catalog', errorPlate: null, controllerConnected: true })
  })

  it('controller alterna a flag sem trocar o mode', () => {
    const next = reducer(base, { type: 'controller', connected: false })
    expect(next).toEqual({ mode: 'catalog', errorPlate: 'ALGO', controllerConnected: false })
  })
})

describe('reducer — ação desconhecida', () => {
  it('retorna o estado inalterado (mesma referência)', () => {
    const next = reducer(base, { type: 'nao-existe' } as unknown as Action)
    expect(next).toBe(base)
  })
})
