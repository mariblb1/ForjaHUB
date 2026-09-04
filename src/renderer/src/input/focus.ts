import type { Intent } from './types'

/**
 * Modelo de foco puro e idêntico entre as três origens de input.
 * `left`/`right` são circulares (wrap), nunca prendem o Visitante num canto.
 * As demais intents não mexem no índice; quem consome decide o que fazer com elas.
 */
export function moveFocus(current: number, count: number, intent: Intent): number {
  if (count <= 0) return current
  switch (intent) {
    case 'left':
      return (((current - 1) % count) + count) % count
    case 'right':
      return (((current + 1) % count) + count) % count
    default:
      return current
  }
}
