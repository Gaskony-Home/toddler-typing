const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Activity management
  startActivity: (activityName) => ipcRenderer.invoke('start-activity', activityName),
  stopActivity: () => ipcRenderer.invoke('stop-activity'),

  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // Letters & Numbers
  getRandomLetterOrNumber: () => ipcRenderer.invoke('get-random-letter-or-number'),
  checkLetterNumberAnswer: (pressedKey, expectedKey) => ipcRenderer.invoke('check-letter-number-answer', pressedKey, expectedKey),

  // Typing Game
  getTypingChallenge: (stage) => ipcRenderer.invoke('get-typing-challenge', stage),
  checkTypingAnswer: (pressedKey, expectedKey, stage) => ipcRenderer.invoke('check-typing-answer', pressedKey, expectedKey, stage),
  getTypingGameProgress: () => ipcRenderer.invoke('get-typing-game-progress'),

  // Progress/Gamification
  getProgress: () => ipcRenderer.invoke('get-progress'),
  awardStars: (activity, count) => ipcRenderer.invoke('award-stars', activity, count),

  // System
  getVersion: () => ipcRenderer.invoke('get-version'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Auto-update
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', () => callback())
});
