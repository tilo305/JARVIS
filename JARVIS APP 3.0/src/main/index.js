const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./ipc-handlers');
const { createMainWindow } = require('./window-manager');
const { initializeSecurity } = require('./security');
require('dotenv').config();

let mainWindow;
let tray;

// Enable live reload for Electron
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

async function createWindow() {
  // Initialize security measures
  initializeSecurity();
  
  // Create the browser window
  mainWindow = createMainWindow();
  
  // Setup IPC handlers
  setupIpcHandlers(mainWindow);
  
  // Load the index.html
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// System tray functionality
function createTray() {
  tray = new Tray(path.join(__dirname, '../../build/icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Jarvis', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Jarvis AI Assistant');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});