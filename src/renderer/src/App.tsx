import { type JSX, useEffect, useReducer } from 'react'
import { initialState, reducer } from './state/reducer'

/**
 * Shell mínimo do Kiosk. Sem tela real: só exercita a máquina de
 * estados e o caminho main→renderer via `forjaAPI`.
 */
export default function App(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    let alive = true

    window.forjaAPI.hydrate().then((res) => {
      if (alive && res.ok) dispatch({ type: 'set-mode', mode: res.mode })
    })

    // Ctrl+Shift+O → placeholder de Operador.
    const off = window.forjaAPI.onOperatorOpen(() =>
      dispatch({ type: 'set-mode', mode: 'operator' })
    )

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
