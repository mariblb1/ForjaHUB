interface ForjaAPI {
  loadGames: () => Promise<Game[]>
  refreshCache: () => Promise<void>
  launchExe: (path: string) => Promise<void>
  launchUrl: (url: string) => Promise<void>
  logEvent: (event: string, data?: Record<string, unknown>) => Promise<void>
  onGameStatus: (callback: (status: string) => void) => () => void
  toggleFullScreen: () => Promise<void>
}

declare global {
  interface Window {
    forjaAPI: ForjaAPI
  }
}
