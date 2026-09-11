import { type JSX, useRef, useState } from 'react'
import { moveFocus } from './input/focus'
import { useInputIntents } from './input/hooks/use-input-intents'

const BOX_COUNT = 6

/**
 * Harness mínimo de foco.
 */
export default function FocusHarness(): JSX.Element {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [lastAction, setLastAction] = useState('nenhuma ainda')
  const focusedIndexRef = useRef(focusedIndex)

  useInputIntents({
    onIntent: (intent) => {
      if (intent === 'confirm') {
        setLastAction(`confirmar (caixa ${focusedIndexRef.current + 1})`)
        return
      }
      if (intent === 'back') {
        setLastAction('voltar')
        return
      }
      const next = moveFocus(focusedIndexRef.current, BOX_COUNT, intent)
      focusedIndexRef.current = next
      setFocusedIndex(next)
    }
  })

  const focusHere = (index: number): void => {
    focusedIndexRef.current = index
    setFocusedIndex(index)
  }

  const confirm = (index: number): void => {
    focusHere(index)
    setLastAction(`confirmar (caixa ${index + 1})`)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {Array.from({ length: BOX_COUNT }, (_, i) => {
          const focused = i === focusedIndex
          return (
            <div
              key={i}
              onMouseEnter={() => focusHere(i)}
              onClick={() => confirm(i)}
              className="flex h-16 w-16 cursor-pointer items-center justify-center text-lg transition-transform"
              style={{
                border: focused ? '2px solid #d21312' : '2px solid transparent',
                transform: focused ? 'scale(1.22) translateY(-9px)' : 'scale(1)',
                background: '#241a16',
                color: '#f4e9e3'
              }}
            >
              {i + 1}
            </div>
          )
        })}
      </div>
      <p className="m-0 text-sm opacity-70">última ação: {lastAction}</p>
    </div>
  )
}
