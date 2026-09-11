import type { Intent } from './types'

/**
 * Mapa de teclado com a mesma paridade do Controle (Setas/Enter/Esc).
 */
export function mapKeyToIntent(e: { key: string; repeat: boolean }): Intent | null {
  if (e.repeat) return null
  switch (e.key) {
    case 'ArrowUp':
      return 'up'
    case 'ArrowDown':
      return 'down'
    case 'ArrowLeft':
      return 'left'
    case 'ArrowRight':
      return 'right'
    case 'Enter':
      return 'confirm'
    case 'Escape':
      return 'back'
    default:
      return null
  }
}
