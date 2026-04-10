import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/channels'

contextBridge.exposeInMainWorld('forjaAPI', {
  selectAndLoadFile: () => ipcRenderer.invoke(IPC.SELECT_AND_LOAD_FILE),
  parseCsv: (csvText: string) => ipcRenderer.invoke(IPC.PARSE_CSV, csvText),
  saveCache: (data: unknown) => ipcRenderer.invoke(IPC.SAVE_CACHE, data),
  loadCache: () => ipcRenderer.invoke(IPC.LOAD_CACHE),
  minimizeWindow: () => ipcRenderer.invoke(IPC.MINIMIZE_WINDOW),
  toggleFullscreen: () => ipcRenderer.invoke(IPC.TOGGLE_FULLSCREEN),
  launchURL: (url: string) => ipcRenderer.invoke(IPC.LAUNCH_URL, url),
  launchExe: (exePath: string) => ipcRenderer.invoke(IPC.LAUNCH_EXE, exePath),
  onGameStatus: (cb: (status: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, status: string) => cb(status)
    ipcRenderer.on(IPC.GAME_STATUS, handler)
    return () => ipcRenderer.removeListener(IPC.GAME_STATUS, handler)
  },
  onGameClosed: (cb: () => void) => {
    const handler = () => cb()
    ipcRenderer.on(IPC.GAME_CLOSED, handler)
    return () => ipcRenderer.removeListener(IPC.GAME_CLOSED, handler)
  }
})
