import { fetchFromLocal } from 'src/services/googleSheets'
/// <reference types="vite/client" />
import type { ForjaHubData } from '../../types/game'

interface ForjaAPI {
  loadDataJson: () => Promise<ForjaHubData>
  fetchFromLocal: (path: string) => Promise<string>
}

declare global {
  interface Window {
    forjaAPI: ForjaAPI
  }
}

export {}
