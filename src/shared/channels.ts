export const IPC = {
  // Dados
  LOAD_GAMES: 'data:load-games',
  REFRESH_CACHE: 'data:refresh-cache',
  SELECT_AND_LOAD_FILE: 'data:select-and-load-file',
  PARSE_CSV: 'data:parse-csv',
  SAVE_CACHE: 'data:save-cache',
  LOAD_CACHE: 'data:load-cache',

  // Launcher
  LAUNCH_EXE: 'launcher:run-exe',
  LAUNCH_URL: 'launcher:open-url',
  GAME_STATUS: 'launcher:game-status',

  // Analytics
  LOG_EVENT: 'analytics:log-event',
  EXPORT_LOGS: 'analytics:export-logs',

  // Sistema
  TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
  MINIMIZE_WINDOW: 'window:minimize'
} as const
