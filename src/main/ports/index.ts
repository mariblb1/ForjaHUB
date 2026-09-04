import type {
  BuildStatus,
  Catalogo,
  CommandResult,
  ConfigEstacao,
  Jogo,
  RegistroAnalytics
} from '@shared/types'

/* Fonte do Catálogo: Google Sheets API + Drive API */
export interface CatalogSource {
  sync(jogosSelecionados: string[]): Promise<CommandResult<{ catalogo: Catalogo }>>
}

/* Distribuição de builds — zip por `id` na pasta Drive `builds/`. */
export interface GameBinarySource {
  sync(jogos: Jogo[]): Promise<Array<{ jogoId: string; buildStatus: BuildStatus }>>
}

export interface AnalyticsSink {
  flush(registros: RegistroAnalytics[]): Promise<{ idsAceitos: string[] }>
}

export type ExitInfo = { durationMs: number; code: number | null }

export interface GameLauncher {
  launch(exeAbs: string, opts?: { processoAlvo?: string }): Promise<'started' | 'error'>
  /**
   * Assina o fim da Sessão de Jogo. Detecção primária: `child.on('exit')` do
   * handle spawnado. Com `processoAlvo` (wrapper) troca para name-poll. Dispara no
   * máximo uma vez por `launch`.
   */
  onExited(cb: (info: ExitInfo) => void): () => void
}

/* Persistência em `userData/` */
export interface Store {
  lerConfigEstacao(): Promise<ConfigEstacao | null>
  gravarConfigEstacao(config: ConfigEstacao): Promise<void>
}
