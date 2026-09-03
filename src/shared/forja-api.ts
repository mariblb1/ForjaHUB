import type { CommandResult, Mode } from './types'

/**
 * Superfície da ponte tipada única.
 * Ainda expõe só o mínimo do shell Kiosk.
 */
export interface ForjaAPI {
  hydrate(): Promise<CommandResult<{ mode: Mode }>>

  /* Assina o evento `operator:open` (Ctrl+Shift+O). Retorna a função de cleanup. */
  onOperatorOpen(cb: () => void): () => void
}
