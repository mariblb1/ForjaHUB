import { afterAll, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { ExitInfo } from '../../ports'
import { createGameLauncher } from '../index'

// C5: dev/teste é Linux; o ramo `processo_alvo` real (`tasklist`) e a calibração
// dos números são Windows-shaped (Story 13). Aqui o `probe` é sempre fake.
const onLinux = process.platform !== 'win32'

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const tempDirs: string[] = []

/** Executável real curto: um `.sh` que dorme `sec` segundos e sai com `code`. */
function fakeExe(sec: number, code = 0): string {
  const dir = mkdtempSync(join(tmpdir(), 'forja-launch-'))
  tempDirs.push(dir)
  const p = join(dir, 'fake-game.sh')
  writeFileSync(p, `#!/bin/sh\nsleep ${sec}\nexit ${code}\n`, { mode: 0o755 })
  return p
}

/** Promise que resolve no próximo `exited` do launcher. */
function nextExit(l: ReturnType<typeof createGameLauncher>): Promise<ExitInfo> {
  return new Promise((resolve) => l.onExited(resolve))
}

afterAll(() => {
  for (const d of tempDirs) rmSync(d, { recursive: true, force: true })
})

describe.skipIf(!onLinux)('createGameLauncher', () => {
  it('exe direto — vida normal: started, depois um exited com code 0 e duração > 0', async () => {
    const l = createGameLauncher({ probe: vi.fn() })
    const exits: ExitInfo[] = []
    l.onExited((i) => exits.push(i))

    await expect(l.launch(fakeExe(0.3), {})).resolves.toBe('started')
    await sleep(700)

    expect(exits).toHaveLength(1)
    expect(exits[0].code).toBe(0)
    expect(exits[0].durationMs).toBeGreaterThan(0)
  }, 10_000)

  it('exeAbs inválido: string vazia ou caminho relativo resolve error sem spawnar', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const l = createGameLauncher()
    const exits: ExitInfo[] = []
    l.onExited((i) => exits.push(i))

    expect(await l.launch('')).toBe('error')
    expect(await l.launch('relativo/jogo')).toBe('error')
    await sleep(150)

    expect(exits).toHaveLength(0)
    expect(err).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('spawn falha: caminho absoluto inexistente resolve error e nenhum exited', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const l = createGameLauncher()
    const exits: ExitInfo[] = []
    l.onExited((i) => exits.push(i))

    await expect(l.launch('/nao/existe/jogo-zzz')).resolves.toBe('error')
    await sleep(300)

    expect(exits).toHaveLength(0)
    vi.restoreAllMocks()
  })

  it('wrapper — alvo já de pé: exit do bootstrapper ignorado; poll encerra ao ver o alvo sumir', async () => {
    let alvoUp = true
    const probe = vi.fn(async () => alvoUp)
    const l = createGameLauncher({ probe, pollMs: 20, startupGraceMs: 5000 })
    const done = nextExit(l)

    expect(await l.launch(fakeExe(0.03), { processoAlvo: 'Jogo.exe' })).toBe('started')
    await sleep(200)
    alvoUp = false

    const info = await done
    expect(probe).toHaveBeenCalledWith('Jogo.exe')
    expect(info.code).toBe(0)
  }, 10_000)

  it('wrapper — corrida no start: bootstrapper sai antes do alvo aparecer, sem exited prematuro', async () => {
    let alvoUp = false
    const probe = vi.fn(async () => alvoUp)
    const l = createGameLauncher({ probe, pollMs: 20, startupGraceMs: 5000 })
    let exited = false
    l.onExited(() => {
      exited = true
    })
    const done = nextExit(l)

    expect(await l.launch(fakeExe(0.03), { processoAlvo: 'Jogo.exe' })).toBe('started')
    await sleep(150)
    expect(exited).toBe(false)

    alvoUp = true
    await sleep(80)
    alvoUp = false

    const info = await done
    expect(info.code).toBe(0)
  }, 10_000)

  it('wrapper — alvo nunca aparece e child já saiu: exited ao fim de startupGraceMs', async () => {
    const probe = vi.fn(async () => false)
    const l = createGameLauncher({ probe, pollMs: 1000, startupGraceMs: 150 })
    const done = nextExit(l)

    const t0 = Date.now()
    expect(await l.launch(fakeExe(0.03), { processoAlvo: 'Jogo.exe' })).toBe('started')

    const info = await done
    expect(info.code).toBe(0)
    expect(Date.now() - t0).toBeGreaterThanOrEqual(130)
  }, 10_000)

  it('wrapper — alvo nunca aparece mas child vivo: segue no poll até o child sair', async () => {
    const probe = vi.fn(async () => false)
    const l = createGameLauncher({ probe, pollMs: 25, startupGraceMs: 80 })
    let exited = false
    l.onExited(() => {
      exited = true
    })
    const done = nextExit(l)

    expect(await l.launch(fakeExe(0.4), { processoAlvo: 'Jogo.exe' })).toBe('started')
    await sleep(200)
    expect(exited).toBe(false)

    const info = await done
    expect(info.code).toBe(0)
  }, 10_000)

  it('probe rejeita: tick inconclusivo — não encerra, main não quebra, loga uma vez', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const probe = vi.fn(async () => {
      throw new Error('probe explodiu')
    })
    const l = createGameLauncher({ probe, pollMs: 20, startupGraceMs: 120 })
    const done = nextExit(l)

    expect(await l.launch(fakeExe(0.05), { processoAlvo: 'Jogo.exe' })).toBe('started')

    const info = await done
    expect(info.code).toBe(0)
    expect(err).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  }, 10_000)

  it('double-spawn / PID reciclado: exited dispara uma vez pelo handle, sem name-poll', async () => {
    const probe = vi.fn()
    const l = createGameLauncher({ probe })
    const exits: ExitInfo[] = []
    l.onExited((i) => exits.push(i))

    expect(await l.launch(fakeExe(0.2))).toBe('started')
    await sleep(600)

    expect(exits).toHaveLength(1)
    expect(exits[0].code).toBe(0)
    expect(probe).not.toHaveBeenCalled()
  }, 10_000)

  it('launch concorrente: segunda chamada resolve error e não afeta a Sessão viva', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const l = createGameLauncher()
    const exits: ExitInfo[] = []
    l.onExited((i) => exits.push(i))

    const exe = fakeExe(0.4)
    expect(await l.launch(exe)).toBe('started')
    expect(await l.launch(exe)).toBe('error')
    expect(warn).toHaveBeenCalled()

    await sleep(700)
    expect(exits).toHaveLength(1)
    expect(exits[0].code).toBe(0)
    vi.restoreAllMocks()
  }, 10_000)

  it('desinscrição: off() antes do fim ⇒ aquele cb não roda; os demais sim', async () => {
    const l = createGameLauncher()
    const cb1 = vi.fn()
    const off = l.onExited(cb1)
    const seen2 = new Promise<void>((resolve) => l.onExited(() => resolve()))
    off()

    expect(await l.launch(fakeExe(0.15))).toBe('started')
    await seen2

    expect(cb1).not.toHaveBeenCalled()
  }, 10_000)

  it('guarda síncrona: dois launch() sem await ⇒ um started, um error, um só exited', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const l = createGameLauncher()
    const exits: ExitInfo[] = []
    l.onExited((i) => exits.push(i))

    const exe = fakeExe(0.2)
    const [a, b] = await Promise.all([l.launch(exe), l.launch(exe)])
    expect([a, b].sort()).toEqual(['error', 'started'])

    await sleep(500)
    expect(exits).toHaveLength(1)
    vi.restoreAllMocks()
  }, 10_000)

  it('code != 0 do processo é propagado verbatim para ExitInfo.code', async () => {
    const l = createGameLauncher({ probe: vi.fn() })
    const done = nextExit(l)

    expect(await l.launch(fakeExe(0.05, 3))).toBe('started')

    const info = await done
    expect(info.code).toBe(3)
  }, 10_000)

  it('spawn lança de forma síncrona (path com NUL) ⇒ resolve error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const l = createGameLauncher()
    const exits: ExitInfo[] = []
    l.onExited((i) => exits.push(i))

    expect(await l.launch('/tmp/jogo' + String.fromCharCode(0) + '.sh')).toBe('error')
    await sleep(100)

    expect(exits).toHaveLength(0)
    vi.restoreAllMocks()
  })

  it('MISS_THRESHOLD: um único probe ausente não encerra; o segundo consecutivo sim', async () => {
    const pendentes: Array<(v: boolean) => void> = []
    const probe = vi.fn(() => new Promise<boolean>((r) => pendentes.push(r)))
    const l = createGameLauncher({ probe, pollMs: 5, startupGraceMs: 5000 })
    let exited = false
    const done = nextExit(l)
    l.onExited(() => {
      exited = true
    })

    expect(await l.launch(fakeExe(3), { processoAlvo: 'Jogo.exe' })).toBe('started')

    const responder = async (v: boolean): Promise<void> => {
      while (pendentes.length === 0) await sleep(3)
      pendentes.shift()!(v)
      await sleep(15)
    }

    await responder(true)
    await responder(false)
    expect(exited).toBe(false)
    await responder(false)

    const info = await done
    expect(info.code).toBeNull()
  }, 10_000)

  it('processoAlvo inválido: warn + segue só por handle (probe nunca chamado)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const probe = vi.fn()
    const l = createGameLauncher({ probe })
    const done = nextExit(l)

    expect(await l.launch(fakeExe(0.05), { processoAlvo: 'nome invalido!!' })).toBe('started')

    const info = await done
    expect(info.code).toBe(0)
    expect(probe).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
    vi.restoreAllMocks()
  }, 10_000)
})
