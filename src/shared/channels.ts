/**
 * Mapa único de canais IPC — importado por `main` e `preload`.
 * Ainda só liga `WINDOW_TOGGLE_FULLSCREEN`, `WINDOW_QUIT`, `OPERATOR_OPEN` e
 * `APP_HYDRATE`. O restante entra como constante para fixar o contrato agora.
 */
export const IPC = {
  // Comandos renderer → main (ipcRenderer.invoke / ipcMain.handle)
  APP_HYDRATE: 'app:hydrate',
  CONFIG_ROSTER: 'config:roster',
  WINDOW_TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
  WINDOW_QUIT: 'window:quit',
  OPERATOR_FORCE_SYNC: 'operator:force-sync',
  OPERATOR_REOPEN_SETUP: 'operator:reopen-setup',
  ANALYTICS_FLUSH: 'analytics:flush',

  // Eventos main → renderer (webContents.send)
  CATALOG_UPDATED: 'catalog:updated',
  SYNC_RESULT: 'sync:result',
  SYNC_BUILD_STATUS: 'sync:build-status',
  GAME_STATUS: 'game:status',
  CONTROLLER_STATUS: 'controller:status',
  OPERATOR_OPEN: 'operator:open'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]
