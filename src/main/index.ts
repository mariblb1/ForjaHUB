import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { readFileSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ipcMain, shell } from 'electron'
import { globalShortcut } from 'electron'
import { IPC } from '../shared/channels'
import { csvToForjaHubData } from '../services/csvParser'
import * as path from 'path'
import { create } from 'domain'
//import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  const isDev = process.env.NODE_ENV === 'development'

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    fullscreen: !isDev,
    kiosk: !isDev, // trava no app, oculta taskbar
    frame: false, // remove barra de título
    autoHideMenuBar: true,
    alwaysOnTop: true, // opcional: impede popups do SO
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

///////////////////////////////////////
//dadods
ipcMain.handle(IPC.LOAD_GAMES, async () => {
  return []
})

ipcMain.handle(IPC.REFRESH_CACHE, async () => {})
//launcher
ipcMain.handle(IPC.LAUNCH_URL, async (_event, url: string) => {
  await shell.openExternal(url)
})
//sistema
ipcMain.handle(IPC.TOGGLE_FULLSCREEN, async () => {
  const win = BrowserWindow.getFocusedWindow()
  win?.setFullScreen(!win.isFullScreen())
})

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.minimize()
  })
})

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit())
})

app.on('will-quit', () => globalShortcut.unregisterAll())

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('fetch-local-csv', async (_event, csvPath: string) => {
  const text = readFileSync(csvPath, 'utf-8')
  return csvToForjaHubData(text)
})

ipcMain.handle('load-data-json', async () => {
  const jsonPath = path.join(app.getPath('userData'), 'data.json')
  const text = readFileSync(jsonPath, 'utf-8')
  return JSON.parse(text)
})
