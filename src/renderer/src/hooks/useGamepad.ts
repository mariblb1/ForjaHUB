import { useEffect } from 'react'

const DEADZONE = 0.4
const REPEAT_DELAY = 400
const REPEAT_INTERVAL = 100
const DEDUP_MS = 60  // janela para ignorar duplicados (botão + eixo ao mesmo tempo)

const BUTTON_KEYS: Record<number, string> = {
  0: 'Enter',    // A (Xbox) / Cross/X (PS)
  1: 'Escape',   // B (Xbox) / Circle/O (PS)
  2: 'Enter',    // X (Xbox) / Square (PS)
  3: 'Escape',   // Y (Xbox) / Triangle (PS)
  9: 'Enter',    // Start / Options
  12: 'ArrowUp',
  13: 'ArrowDown',
  14: 'ArrowLeft',
  15: 'ArrowRight',
}

// Deduplica: se a mesma tecla foi disparada há menos de DEDUP_MS, ignora
const lastFired: Record<string, number> = {}
function fire(key: string) {
  const now = Date.now()
  if (now - (lastFired[key] ?? 0) < DEDUP_MS) return
  lastFired[key] = now
  // Despacha a partir do elemento focado para que borbulhe normalmente pelo DOM
  // (chega a React onKeyDown, window listeners, e activa comportamentos nativos)
  const target = (document.activeElement as HTMLElement) ?? document.body
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

export function useGamepad() {
  useEffect(() => {
    let rafId: number
    const prevBtn: boolean[][] = [[], [], [], []]
    const axisActive: Record<string, boolean> = {}
    const axisHeld: Record<string, number> = {}
    const axisRepeat: Record<string, number> = {}

    function axis(id: string, key: string, active: boolean) {
      const now = Date.now()
      if (active) {
        if (!axisActive[id]) {
          fire(key)
          axisHeld[id] = now
          axisRepeat[id] = now
        } else if (now - axisHeld[id] > REPEAT_DELAY && now - axisRepeat[id] > REPEAT_INTERVAL) {
          fire(key)
          axisRepeat[id] = now
        }
      }
      axisActive[id] = active
    }

    function poll() {
      for (let gi = 0; gi < 4; gi++) {
        const gp = navigator.getGamepads()[gi]
        if (!gp) continue

        gp.buttons.forEach((btn, i) => {
          const key = BUTTON_KEYS[i]
          if (key && btn.pressed && !prevBtn[gi][i]) fire(key)
          prevBtn[gi][i] = btn.pressed
        })

        axis(`${gi}L`, 'ArrowLeft',  (gp.axes[0] ?? 0) < -DEADZONE)
        axis(`${gi}R`, 'ArrowRight', (gp.axes[0] ?? 0) >  DEADZONE)
        axis(`${gi}U`, 'ArrowUp',    (gp.axes[1] ?? 0) < -DEADZONE)
        axis(`${gi}D`, 'ArrowDown',  (gp.axes[1] ?? 0) >  DEADZONE)
      }
      rafId = requestAnimationFrame(poll)
    }

    rafId = requestAnimationFrame(poll)
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [])
}
