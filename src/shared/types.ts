/**
 * Tipos compartilhados entre `main` e `renderer` (AD-1).
 * Nomes de entidade em PT-BR, iguais ao Glossário do PRD.
 *
 * Story 1: `Mode` / `KioskState` / `CommandResult` completos; as entidades de
 * domínio entram como stub mínimo e são expandidas pelas stories que as usam
 * (Jogo/Catalogo → Story 5/7; RegistroAnalytics → Story 10; ConfigEstacao → Story 4).
 */

/** Estado visual do renderer é uma máquina de estados tipada — telas são estados, não rotas (AD-4). */
export type Mode = 'boot' | 'setup' | 'attract' | 'catalog' | 'detail' | 'launching' | 'operator'

export interface KioskState {
  mode: Mode
  /** Placa de erro coexiste com qualquer `mode` — não é um estado do union (AD-4). */
  errorPlate: string | null
  /** Controle conectado coexiste com qualquer `mode`; desconectar não congela a navegação (AD-4). */
  controllerConnected: boolean
}

/**
 * Resultado de todo comando do `forjaAPI`
 * (ARCHITECTURE-SPINE § Consistency Conventions). O renderer traduz `code` para
 * microcopy do EXPERIENCE.md; nunca mostra `msg` cru ao Visitante.
 */
export type CommandResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; code: string; msg?: string }

// --- Entidades de domínio (stubs — ver cabeçalho) ---------------------------

export type BuildStatus = 'ausente' | 'baixando' | 'pronto' | 'erro'

export interface Jogo {
  /** Slug kebab-case, dono é a Planilha, nunca derivado do título (AD-12). */
  id: string
  ordem: number
}

export interface Catalogo {
  jogos: Jogo[]
}

export interface RegistroAnalytics {
  /** UUID v4 gerado no cliente (AD-15). */
  id: string
  jogoId: string
}

export interface ConfigEstacao {
  estacaoId: string
  eventoId: string
  jogosSelecionados: string[]
  schemaVersion: number
}

export interface Manifest {
  schemaVersion: number
}
