import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/channels'
import type { ForjaAPI } from '@shared/forja-api'

const forjaAPI: ForjaAPI = {
  hydrate: () => ipcRenderer.invoke(IPC.APP_HYDRATE),
  onOperatorOpen: (cb) => {
    const handler = (): void => cb()
    ipcRenderer.on(IPC.OPERATOR_OPEN, handler)
    return () => ipcRenderer.removeListener(IPC.OPERATOR_OPEN, handler)
  }
}

contextBridge.exposeInMainWorld('forjaAPI', forjaAPI)
