/// <reference types="vite/client" />
import type { ForjaHubData } from '../../types/game'

interface ForjaAPI {
  selectAndLoadFile: () => Promise<ForjaHubData | null>
  parseCsv: (csvText: string) => Promise<ForjaHubData>
  saveCache: (data: ForjaHubData) => Promise<void>
  loadCache: () => Promise<ForjaHubData | null>
  launchExe: (exePath: string) => Promise<void>
  launchURL: (url: string) => Promise<void>
  onGameStatus: (cb: (status: string) => void) => () => void
  onGameClosed: (cb: () => void) => () => void
  minimizeWindow: () => void
  toggleFullscreen: () => void
  logEvent: (type: string, gameId: string, gameTitle: string) => Promise<void>
}

declare global {
  interface Window {
    forjaAPI?: ForjaAPI
  }
}

export {}
