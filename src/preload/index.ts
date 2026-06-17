import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/channels'

contextBridge.exposeInMainWorld('forjaAPI', {
  selectAndLoadFile: () => ipcRenderer.invoke(IPC.SELECT_AND_LOAD_FILE),
  parseCsv: (csvText: string) => ipcRenderer.invoke(IPC.PARSE_CSV, csvText),
  saveCache: (data: unknown) => ipcRenderer.invoke(IPC.SAVE_CACHE, data),
  loadCache: () => ipcRenderer.invoke(IPC.LOAD_CACHE),
  minimizeWindow: () => ipcRenderer.invoke(IPC.MINIMIZE_WINDOW),
  quitApp: () => ipcRenderer.invoke(IPC.QUIT_APP),
  toggleFullscreen: () => ipcRenderer.invoke(IPC.TOGGLE_FULLSCREEN),
  launchURL: (url: string) => ipcRenderer.invoke(IPC.LAUNCH_URL, url),
  launchExe: (exePath: string, gameId: string, gameTitle: string) => ipcRenderer.invoke(IPC.LAUNCH_EXE, exePath, gameId, gameTitle),
  onGameStatus: (cb: (status: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, status: string) => cb(status)
    ipcRenderer.on(IPC.GAME_STATUS, handler)
    return () => ipcRenderer.removeListener(IPC.GAME_STATUS, handler)
  },
  onGameClosed: (cb: () => void) => {
    const handler = () => cb()
    ipcRenderer.on(IPC.GAME_CLOSED, handler)
    return () => ipcRenderer.removeListener(IPC.GAME_CLOSED, handler)
  },
  logEvent: (type: string, gameId: string, gameTitle: string) =>
    ipcRenderer.invoke(IPC.LOG_EVENT, type, gameId, gameTitle),
  getGameStats: () => ipcRenderer.invoke(IPC.GET_GAME_STATS) as Promise<Record<string, number>>,
  exportLogs: () => ipcRenderer.invoke(IPC.EXPORT_LOGS) as Promise<{ success: boolean; reason?: string }>
})
