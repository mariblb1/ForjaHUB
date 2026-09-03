import { MODES, type KioskState } from '@shared/types'

/**
 * Máquina de estados.
 * Telas são estados, não rotas. `errorPlate` e `controllerConnected` coexistem com qualquer `mode`,
 * nunca são um estado do union.
 */

export const initialState: KioskState = {
  mode: 'boot',
  errorPlate: null,
  controllerConnected: false
}

export type Action =
  | { type: 'set-mode'; mode: KioskState['mode'] }
  | { type: 'error-plate'; code: string | null }
  | { type: 'controller'; connected: boolean }

export function reducer(state: KioskState, action: Action): KioskState {
  switch (action.type) {
    case 'set-mode':
      if (!MODES.includes(action.mode) || action.mode === state.mode) return state
      return { ...state, mode: action.mode }
    case 'error-plate':
      if (action.code === state.errorPlate) return state
      return { ...state, errorPlate: action.code }
    case 'controller':
      if (action.connected === state.controllerConnected) return state
      return { ...state, controllerConnected: action.connected }
    default:
      action satisfies never
      return state
  }
}
