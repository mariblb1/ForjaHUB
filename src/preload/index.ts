import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/channels'

contextBridge.exposeInMainWorld('forjaAPI', {
  selectAndLoadFile: () => ipcRenderer.invoke(IPC.SELECT_AND_LOAD_FILE),
  parseCsv: (csvText: string) => ipcRenderer.invoke(IPC.PARSE_CSV, csvText),
  saveCache: (data: unknown) => ipcRenderer.invoke(IPC.SAVE_CACHE, data),
  loadCache: () => ipcRenderer.invoke(IPC.LOAD_CACHE),
  minimizeWindow: () => ipcRenderer.invoke(IPC.MINIMIZE_WINDOW),
  toggleFullscreen: () => ipcRenderer.invoke(IPC.TOGGLE_FULLSCREEN),
  launchURL: (url: string) => ipcRenderer.invoke(IPC.LAUNCH_URL, url)
})
