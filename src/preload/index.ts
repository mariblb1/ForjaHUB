import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/channels'
import { fetchFromLocal } from 'src/services/googleSheets'

// Custom APIs for renderer
const api = {
  //dados
  loadGames: () => ipcRenderer.invoke(IPC.LOAD_GAMES),
  refreshCache: () => ipcRenderer.invoke(IPC.REFRESH_CACHE),

  //launcher
  launchExe: () => (path: string) => ipcRenderer.invoke(IPC.LAUNCH_EXE, path),
  launchURL: (url: string) => ipcRenderer.invoke(IPC.LAUNCH_URL, url),

  //analytics
  logEvent: (event: string, data?: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC.LOG_EVENT, event, data),

  //ouvintes
  onGameStatus: (callback: (status: string) => void) => {
    const handler = (_event: any, status: string) => callback(status)
    ipcRenderer.on(IPC.GAME_STATUS, handler)
    return () => ipcRenderer.removeListener(IPC.GAME_STATUS, handler)
  },

  //sistema
  toggleFullscreen: () => ipcRenderer.invoke(IPC.TOGGLE_FULLSCREEN)
}

contextBridge.exposeInMainWorld('forjaAPI', {
  fetchFromLocal: (csvPath: string) => ipcRenderer.invoke('fetch-local-csv', csvPath),
  loadDataJson: () => ipcRenderer.invoke('load-data-json')
})

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
/* if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('forjaAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
} */
