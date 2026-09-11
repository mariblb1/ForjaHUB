import { useEffect, useState } from 'react'

const HIDE_AFTER_MS = 3000
const CHECK_INTERVAL_MS = 250

export function isCursorVisible(msSinceLastMove: number): boolean {
  return msSinceLastMove < HIDE_AFTER_MS
}

export function useCursorIdle(): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let lastMove = -Infinity

    const onMove = (): void => {
      lastMove = Date.now()
      setVisible(true)
    }
    window.addEventListener('mousemove', onMove)

    const interval = setInterval(() => {
      setVisible(isCursorVisible(Date.now() - lastMove))
    }, CHECK_INTERVAL_MS)

    return () => {
      window.removeEventListener('mousemove', onMove)
      clearInterval(interval)
    }
  }, [])

  return visible
}
