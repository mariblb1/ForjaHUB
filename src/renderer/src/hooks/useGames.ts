import { useQuery } from '@tanstack/react-query'
import type { ForjaHubData } from '../../../types/game'

const EMPTY: ForjaHubData = { version: '1.0.0', updatedAt: new Date().toISOString(), games: [] }

async function loadGamesOnline(): Promise<ForjaHubData> {
  const [jsonRes, csvRes] = await Promise.all([
    fetch('/data.json'),
    fetch('/FORJA_Hub_Mock_Planilha.csv')
  ])

  const jsonData: ForjaHubData = jsonRes.ok ? await jsonRes.json() : EMPTY

  let csvGames: ForjaHubData['games'] = []
  if (csvRes.ok && window.forjaAPI) {
    const csvText = await csvRes.text()
    const csvData = await window.forjaAPI.parseCsv(csvText)
    csvGames = csvData.games
  }

  const merged: ForjaHubData = {
    version: jsonData.version,
    updatedAt: jsonData.updatedAt,
    games: [...jsonData.games, ...csvGames]
  }

  // guarda cache para uso offline
  await window.forjaAPI?.saveCache(merged)

  return merged
}

async function loadGames(): Promise<ForjaHubData> {
  if (navigator.onLine) {
    return loadGamesOnline()
  }

  // offline: carrega cache guardado em userData
  const cached = await window.forjaAPI?.loadCache()
  if (cached) return cached

  // fallback: ficheiro estático local
  const res = await fetch('/data.json')
  if (res.ok) return res.json()

  return EMPTY
}

export function useGames() {
  return useQuery<ForjaHubData>({
    queryKey: ['games'],
    queryFn: loadGames,
    enabled: false
  })
}
