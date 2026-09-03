import type { KioskState, Mode } from '@shared/types'

/**
 * Máquina de estados.
 * Telas são estados, não rotas. `errorPlate` e `controllerConnected` coexistem com qualquer `mode`,
 * nunca são um estado do union.
 */

const MODES = new Set<Mode>([
  'boot',
  'setup',
  'attract',
  'catalog',
  'detail',
  'launching',
  'operator'
])

export const initialState: KioskState = {
  mode: 'boot',
  errorPlate: null,
  controllerConnected: false
}

export type Action =
  | { type: 'set-mode'; mode: Mode }
  | { type: 'error-plate'; code: string | null }
  | { type: 'controller'; connected: boolean }

export function reducer(state: KioskState, action: Action): KioskState {
  switch (action.type) {
    case 'set-mode':
      if (!MODES.has(action.mode) || action.mode === state.mode) return state
      return { ...state, mode: action.mode }
    case 'error-plate':
      return { ...state, errorPlate: action.code }
    case 'controller':
      return { ...state, controllerConnected: action.connected }
    default:
      return state
  }
}
