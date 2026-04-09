import { useQuery } from '@tanstack/react-query'
import type { ForjaHubData } from '../../../types/game'

export function useGames() {
  return useQuery<ForjaHubData>({
    queryKey: ['games'],
    queryFn: async () => {
      return window.forjaAPI.loadDataJson()
    },
    enabled: false // não busca automaticamente
  })
}
