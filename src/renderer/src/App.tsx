import { type JSX, useEffect, useReducer } from 'react'
import { initialState, reducer } from './state/reducer'

/**
 * Shell mínimo do Kiosk. Sem tela real: só exercita a máquina de
 * estados e o caminho main→renderer via `forjaAPI`.
 */
export default function App(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const api = window.forjaAPI
    if (!api) {
      // Preload não injetou a ponte, mostra algo em vez de estourar TypeError.
      dispatch({ type: 'error-plate', code: 'SEM_PONTE' })
      return
    }

    let alive = true

    api
      .hydrate()
      .then((res) => {
        if (!alive) return
        if (res.ok) dispatch({ type: 'set-mode', mode: res.mode })
        else dispatch({ type: 'error-plate', code: res.code })
      })
      .catch(() => {
        if (alive) dispatch({ type: 'error-plate', code: 'HYDRATE_FALHOU' })
      })

    // Ctrl+Shift+O → placeholder de Operador.
    const off = api.onOperatorOpen(() => dispatch({ type: 'set-mode', mode: 'operator' }))

    return () => {
      alive = false
      off()
    }
  }, [])

  return (
    <main className="flex h-full select-none flex-col items-center justify-center gap-2 text-[#f4e9e3]">
      <p className="m-0 text-xs tracking-[0.3em] opacity-50">FORJA HUB</p>
      <p className="m-0 text-3xl">
        modo: <strong>{state.mode}</strong>
      </p>
      {state.errorPlate && <p className="m-0 text-[#e0483f]">erro: {state.errorPlate}</p>}
      {!state.controllerConnected && (
        <p className="m-0 text-sm opacity-50">controle desconectado</p>
      )}
    </main>
  )
}
