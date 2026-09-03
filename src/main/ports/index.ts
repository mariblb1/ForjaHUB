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

export interface GameLauncher {
  launch(exeAbs: string, opts?: { processoAlvo?: string }): Promise<'started' | 'exited' | 'error'>
}

/* Persistência em `userData/` */
export interface Store {
  lerConfigEstacao(): Promise<ConfigEstacao | null>
  gravarConfigEstacao(config: ConfigEstacao): Promise<void>
}
