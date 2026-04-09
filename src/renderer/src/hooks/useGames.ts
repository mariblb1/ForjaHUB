import { useQuery } from '@tanstack/react-query'
import type { ForjaHubData } from '../../../types/game'

async function loadGames(): Promise<ForjaHubData> {
  const [jsonRes, csvRes] = await Promise.all([
    fetch('/data.json'),
    fetch('/FORJA_Hub_Mock_Planilha.csv')
  ])

  const jsonData: ForjaHubData = jsonRes.ok
    ? await jsonRes.json()
    : { version: '1.0.0', updatedAt: new Date().toISOString(), games: [] }

  let csvGames: ForjaHubData['games'] = []
  if (csvRes.ok && window.forjaAPI) {
    const csvText = await csvRes.text()
    const csvData = await window.forjaAPI.parseCsv(csvText)
    csvGames = csvData.games
  }

  return {
    version: jsonData.version,
    updatedAt: jsonData.updatedAt,
    games: [...jsonData.games, ...csvGames]
  }
}

export function useGames() {
  return useQuery<ForjaHubData>({
    queryKey: ['games'],
    queryFn: loadGames,
    enabled: false
  })
}
