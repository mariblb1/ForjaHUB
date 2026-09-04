import { spawn, type ChildProcess } from 'node:child_process'
import { isAbsolute } from 'node:path'
import type { ExitInfo, GameLauncher } from '../ports'
import { defaultProbe, sanitizeProcessName, type ProcessProbe } from './process-probe'

/** Probes ausentes consecutivos exigidos antes de declarar o alvo encerrado. */
const DEFAULT_MISS_THRESHOLD = 2
/** Intervalo padrão do name-poll do escape hatch `processo_alvo` */
const DEFAULT_POLL_MS = 1000
/** Janela padrão para o `processo_alvo` aparecer após o `'started'`. */
const DEFAULT_GRACE_MS = 10_000

type Session = {
  child: ChildProcess
  startedAt: number
  alvo: string | null
  sawTarget: boolean
  missCount: number
  lastChildCode: number | null
  childExited: boolean
  graceExpired: boolean
  done: boolean
  poll: ReturnType<typeof setInterval> | null
  graceTimer: ReturnType<typeof setTimeout> | null
  ticking: boolean
  probeErrLogged: boolean
}

/**
 * Porta do `spawn` detached + monitoramento do `src/` antigo, atrás da
 * interface `GameLauncher`. Detecção primária por `child.on('exit')`;
 * `processo_alvo` troca para name-poll com janela no inicio. Isolado do
 * `renderer`.
 *
 * `deps` existe para os testes: `probe` fake + `pollMs`/`startupGraceMs` curtos
 * exercitam o ramo `processo_alvo` no Linux sem depender de um processo real.
 */
export function createGameLauncher(
  deps: {
    probe?: ProcessProbe
    pollMs?: number
    startupGraceMs?: number
    missThreshold?: number
  } = {}
): GameLauncher {
  const probe = deps.probe ?? defaultProbe
  const pollMs = deps.pollMs ?? DEFAULT_POLL_MS
  const startupGraceMs = deps.startupGraceMs ?? DEFAULT_GRACE_MS
  const missThreshold = deps.missThreshold ?? DEFAULT_MISS_THRESHOLD
  const listeners = new Set<(info: ExitInfo) => void>()
  let session: Session | null = null
  /** Guarda síncrona: cobre a janela entre `spawn` e o evento `spawn`. */
  let starting = false

  function emitExited(code: number | null): void {
    const s = session
    if (!s || s.done) return
    s.done = true
    if (s.poll) clearInterval(s.poll)
    if (s.graceTimer) clearTimeout(s.graceTimer)
    // Só o `'exit'`: o sink de `'error'` fica para não deixar um `'error'` tardio
    // sem listener derrubar o processo `main`.
    s.child.removeAllListeners('exit')
    const info: ExitInfo = { durationMs: Math.max(0, Math.round(performance.now() - s.startedAt)), code }
    session = null
    for (const cb of [...listeners]) {
      try {
        cb(info)
      } catch (err) {
        console.error('[launcher] listener de exited lançou:', err)
      }
    }
  }

  /** `null` = probe inconclusivo (rejeitou/lançou), não conta como ausência. */
  async function safeProbe(s: Session, alvo: string): Promise<boolean | null> {
    try {
      return await probe(alvo)
    } catch (err) {
      if (!s.probeErrLogged) {
        s.probeErrLogged = true
        console.error('[launcher] probe de processo falhou (seguindo mesmo assim):', err)
      }
      return null
    }
  }

  /**
   * Encerra a Sessão quando a janela expirou sem o alvo aparecer e o child já saiu
   * mas nunca enquanto um `probe` está no ar (ele ainda pode ver o alvo subir).
   */
  function finishIfGraceElapsed(s: Session): void {
    if (
      session === s &&
      !s.done &&
      s.alvo &&
      s.graceExpired &&
      !s.sawTarget &&
      s.childExited &&
      !s.ticking
    ) {
      emitExited(s.lastChildCode)
    }
  }

  function onChildExit(code: number | null): void {
    const s = session
    if (!s || s.done) return
    s.lastChildCode = code
    s.childExited = true
    if (!s.alvo) {
      emitExited(code)
      return
    }
    if (s.sawTarget) return
    finishIfGraceElapsed(s) // bad-config: alvo nunca subiu e o child saiu
    // senão: o graceTimer (ou o poll, se o alvo ainda aparecer) decide
  }

  function onGrace(): void {
    const s = session
    if (!s || s.done) return
    s.graceExpired = true
    // alvo nunca apareceu na janela: se o child já saiu, encerra; se ainda vive,
    // ele é o próprio Jogo, deixa o poll seguir até o `child.on('exit')`.
    finishIfGraceElapsed(s)
  }

  async function tick(): Promise<void> {
    const s = session
    if (!s || s.done || !s.alvo || s.ticking) return
    s.ticking = true
    try {
      const running = await safeProbe(s, s.alvo)
      if (session !== s || s.done || running === null) return
      if (running) {
        s.sawTarget = true
        s.missCount = 0
      } else if (s.sawTarget) {
        s.missCount += 1
        if (s.missCount >= missThreshold) emitExited(s.lastChildCode)
      }
    } finally {
      s.ticking = false
      finishIfGraceElapsed(s) // graça pode ter expirado durante este probe
    }
  }

  return {
    launch(exeAbs, opts) {
      if ((session && !session.done) || starting) {
        console.warn('[launcher] launch ignorado: já há uma Sessão de Jogo ativa')
        return Promise.resolve<'started' | 'error'>('error')
      }
      if (!exeAbs || !isAbsolute(exeAbs)) {
        console.error('[launcher] launch ignorado: exeAbs não é um caminho absoluto:', exeAbs)
        return Promise.resolve<'started' | 'error'>('error')
      }

      const bruto = opts?.processoAlvo
      const alvo = bruto ? sanitizeProcessName(bruto) : null
      if (bruto && !alvo) {
        console.warn('[launcher] processoAlvo inválido, seguindo só por handle:', bruto)
      }

      starting = true
      let child: ChildProcess
      try {
        child = spawn(exeAbs, [], { detached: true, stdio: 'ignore' })
      } catch (err) {
        starting = false
        console.error('[launcher] spawn lançou:', err)
        return Promise.resolve<'started' | 'error'>('error')
      }

      return new Promise<'started' | 'error'>((resolve) => {
        let settled = false
        const settle = (r: 'started' | 'error'): void => {
          if (settled) return
          settled = true
          starting = false
          resolve(r)
        }
        child.on('error', (err) => {
          console.error('[launcher] erro no processo do .exe:', err.message)
          if (!settled) settle('error')
          else if (session && session.child === child && !session.done) {
            emitExited(session.lastChildCode)
          }
        })
        child.once('spawn', () => {
          child.unref()
          session = {
            child,
            startedAt: performance.now(),
            alvo,
            sawTarget: false,
            missCount: 0,
            lastChildCode: null,
            childExited: false,
            graceExpired: false,
            done: false,
            poll: null,
            graceTimer: null,
            ticking: false,
            probeErrLogged: false
          }
          child.once('exit', (code) => onChildExit(code))
          if (alvo) {
            const p = setInterval(() => void tick(), pollMs)
            p.unref()
            session.poll = p
            const g = setTimeout(onGrace, startupGraceMs)
            g.unref()
            session.graceTimer = g
          }
          settle('started')
        })
      })
    },

    onExited(cb) {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    }
  }
}
