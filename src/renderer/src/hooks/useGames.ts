import { useQuery } from '@tanstack/react-query'
import type { ForjaHubData, Game } from '../../../types/game'
import { fetchFromGooogleSheets, fetchFromLocal, FORJA_SHEET_ID } from '../../../services/googleSheets'

const EMPTY: ForjaHubData = { version: '1.0.0', updatedAt: new Date().toISOString(), games: [] }

function mergeGames(...sources: Game[][]): Game[] {
  // Última fonte vence em caso de ID duplicado (Sheets > CSV > JSON)
  const map = new Map<string, Game>()
  for (const games of sources) {
    for (const game of games) {
      if (game.id) map.set(game.id, game)
    }
  }
  return Array.from(map.values())
}

async function loadGamesOnline(): Promise<ForjaHubData> {
  const [jsonResult, sheetsResult, csvResult] = await Promise.allSettled([
    fetch('/data.json').then(r => r.ok ? (r.json() as Promise<ForjaHubData>) : EMPTY),
    fetchFromGooogleSheets(FORJA_SHEET_ID),
    fetchFromLocal('/FORJA_Hub_Mock_Planilha.csv')
  ])

  const jsonGames  = jsonResult.status   === 'fulfilled' ? jsonResult.value.games   : []
  const sheetsGames = sheetsResult.status === 'fulfilled' ? sheetsResult.value.games : []
  const csvGames   = csvResult.status    === 'fulfilled' ? csvResult.value.games    : []

  const merged: ForjaHubData = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    games: mergeGames(jsonGames, csvGames, sheetsGames)
  }

  await window.forjaAPI?.saveCache(merged)
  return merged
}

async function loadGames(): Promise<ForjaHubData> {
  if (navigator.onLine) {
    try {
      return await loadGamesOnline()
    } catch {
      // todas as fontes falharam — cai no offline
    }
  }

  const cached = await window.forjaAPI?.loadCache()
  if (cached) return cached as ForjaHubData

  const res = await fetch('/data.json')
  if (res.ok) return res.json()

  return EMPTY
}

export function useGames() {
  return useQuery<ForjaHubData>({
    queryKey: ['games'],
    queryFn: loadGames,
    enabled: false,
    staleTime: 5 * 60 * 1000
  })
}
