export const IPC = {
  // Dados
  LOAD_GAMES: 'data:load-games',
  REFRESH_CACHE: 'data:refresh-cache',

  // Launcher
  LAUNCH_EXE: 'launcher:run-exe',
  LAUNCH_URL: 'launcher:open-url',
  GAME_STATUS: 'launcher:game-status',

  // Analytics
  LOG_EVENT: 'analytics:log-event',
  EXPORT_LOGS: 'analytics:export-logs',

  // Sistema
  TOGGLE_FULLSCREEN: 'window:toggle-fullscreen'
} as const
