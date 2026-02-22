const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Activity management
  startActivity: (activityName) => ipcRenderer.invoke('start-activity', activityName),
  stopActivity: () => ipcRenderer.invoke('stop-activity'),

  // Voice/Audio
  speak: (text, interrupt) => ipcRenderer.invoke('speak', text, interrupt),
  speakText: (text) => ipcRenderer.invoke('speak-text', text),
  toggleVoice: () => ipcRenderer.invoke('toggle-voice'),
  setVoiceEnabled: (enabled) => ipcRenderer.invoke('set-voice-enabled', enabled),
  setMuted: (muted) => ipcRenderer.invoke('set-muted', muted),

  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // Letters & Numbers
  getRandomLetterOrNumber: () => ipcRenderer.invoke('get-random-letter-or-number'),
  checkLetterNumberAnswer: (pressedKey, expectedKey) => ipcRenderer.invoke('check-letter-number-answer', pressedKey, expectedKey),

  // Progress/Gamification
  getProgress: () => ipcRenderer.invoke('get-progress'),
  awardStars: (activity, count) => ipcRenderer.invoke('award-stars', activity, count),

  // Character control
  playCharacterAnimation: (animationName, loop) => ipcRenderer.invoke('play-character-animation', animationName, loop),
  setCharacterEmotion: (emotion) => ipcRenderer.invoke('set-character-emotion', emotion),
  characterStartTalking: () => ipcRenderer.invoke('character-start-talking'),
  characterStopTalking: () => ipcRenderer.invoke('character-stop-talking'),

  // System
  getVersion: () => ipcRenderer.invoke('get-version'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Auto-update
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback())
});
