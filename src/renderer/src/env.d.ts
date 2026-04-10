/// <reference types="vite/client" />
import type { ForjaHubData } from '../../types/game'

interface ForjaAPI {
  selectAndLoadFile: () => Promise<ForjaHubData | null>
  parseCsv: (csvText: string) => Promise<ForjaHubData>
  saveCache: (data: ForjaHubData) => Promise<void>
  loadCache: () => Promise<ForjaHubData | null>
  minimizeWindow: () => void
  toggleFullscreen: () => void
  launchURL: (url: string) => void
}

declare global {
  interface Window {
    forjaAPI?: ForjaAPI
  }
}

declare module '*.png' {
  const src: string
  export default src
}

export {}
