const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipc-handlers');
const { KeyboardLocker } = require('./modules/keyboard-locker');
const { AutoUpdater } = require('./modules/auto-updater');

let mainWindow = null;
let keyboardLocker = null;
let autoUpdaterInstance = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Toddler Typing',
    backgroundColor: '#f8f9fa',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    icon: path.join(__dirname, '..', 'src', 'toddler_typing', 'web', 'assets', 'dino_character.png')
  });

  const indexPath = path.join(__dirname, '..', 'src', 'toddler_typing', 'web', 'index.html');
  mainWindow.loadFile(indexPath);

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Register IPC handlers before creating window
  keyboardLocker = new KeyboardLocker();
  registerIpcHandlers(keyboardLocker);

  createWindow();

  // Initialize auto-updater after window is created
  autoUpdaterInstance = new AutoUpdater(mainWindow);

  ipcMain.handle('download-update', () => {
    if (autoUpdaterInstance) autoUpdaterInstance.downloadUpdate();
  });

  ipcMain.handle('quit-and-install', () => {
    if (autoUpdaterInstance) autoUpdaterInstance.quitAndInstall();
  });

  // Check for updates after a short delay to let the app settle
  setTimeout(() => {
    if (autoUpdaterInstance) autoUpdaterInstance.checkForUpdates();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();

  // Clean up keyboard locker
  if (keyboardLocker) {
    keyboardLocker.cleanup();
  }

  app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (keyboardLocker) {
    keyboardLocker.cleanup();
  }
});
