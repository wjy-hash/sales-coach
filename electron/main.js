const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'
const cloudUrl = process.env.CLOUD_URL || ''
const isCloud = !!cloudUrl
const SERVER_PORT = 3001

function startServer() {
  // Only start local server in desktop mode (not cloud)
  if (isCloud) return
  const serverPath = path.join(__dirname, '..', 'server', 'dist', 'index.js')
  const { createApp } = require(serverPath)
  const expressApp = createApp()
  expressApp.listen(SERVER_PORT, () => {
    console.log(`[server] running on http://localhost:${SERVER_PORT}`)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: isCloud ? 420 : 1400,
    height: isCloud ? 860 : 900,
    minWidth: isCloud ? 320 : 900,
    minHeight: isCloud ? 480 : 600,
    title: '销售AI陪练',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  let url
  if (isCloud) {
    url = cloudUrl
  } else if (isDev) {
    url = 'http://localhost:5173'
  } else {
    url = `http://localhost:${SERVER_PORT}`
  }

  mainWindow.loadURL(url)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  if (!isDev && !isCloud) {
    try { startServer() } catch (err) {
      console.error('[electron] Failed to start server:', err.message)
    }
  }
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
