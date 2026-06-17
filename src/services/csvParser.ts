import type { Game, ForjaHubData, GameCredit } from '../types/game'

function parseCsvRows(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] || '').trim()
    })
    rows.push(row)
  }
  return rows
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function rowToGame(row: Record<string, string>): Game {
  return {
    id: row.id || '',
    title: row.title || '',
    subtitle: row.subtitle || undefined,
    description: row.description || '',
    genre: splitField(row.genre),
    tags: splitField(row.tags),
    mode: parseMode(row.mode),
    maxPlayers: row.maxPlayers ? parseInt(row.maxPlayers, 10) : undefined,
    cover: row.cover || '',
    banner: row.banner || undefined,
    gallery: [],
    studio: row.studio || '',
    studioLogo: row.studioLogo || undefined,
    credits: parseCredits(row),
    launchType: row.launchType === 'web' ? 'web' : 'local',
    executablePath: row.executablePath || undefined,
    webUrl: row.webUrl || undefined,
    year: row.year ? parseInt(row.year, 10) : undefined,
    featured: row.featured === 'true',
    sortOrder: row.sortOrder ? parseInt(row.sortOrder, 10) : undefined
  }
}

function splitField(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function parseMode(value: string): 'singleplayer' | 'multiplayer' | 'coop' {
  if (value == 'multiplayer' || value == 'coop' || value == 'singleplayer') return value
  throw new Error('Modo de jogo inválido')
}

function parseCredits(row: Record<string, string>): GameCredit[] {
  const credits: GameCredit[] = []
  if (row.studio) {
    credits.push({ role: 'Desenvolvedor', name: row.studio })
  }
  return credits
}

export function csvToForjaHubData(csvText: string): ForjaHubData {
  const rows = parseCsvRows(csvText)
  const games = rows.map(rowToGame).filter((g) => g.id && g.title)

  return {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    games
  }
}
