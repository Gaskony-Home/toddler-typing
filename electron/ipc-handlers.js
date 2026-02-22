const { ipcMain } = require('electron');
const { ProgressManager } = require('./modules/progress-manager');
const { SettingsManager } = require('./modules/settings-manager');

// Security constants
const MAX_TEXT_LENGTH = 500;
const MAX_KEY_LENGTH = 10;
const VALID_ACTIVITIES = new Set(['letters_numbers', 'drawing', 'colors_shapes', 'coloring', 'dot2dot', 'sounds']);
const VALID_THEMES = new Set(['light', 'dark']);
const ALPHANUMERIC_RE = /^[a-zA-Z0-9]+$/;

// Version (read from package.json)
const APP_VERSION = require('../package.json').version;

// State
let currentActivity = null;
let progressManager = null;
let settingsManager = null;
let keyboardLocker = null;

// Encouragement messages
const ENCOURAGEMENTS = [
  'Great job!',
  'Excellent!',
  'Well done!',
  'Amazing!',
  'Fantastic!',
  "You're doing great!"
];

function validateString(value, maxLength) {
  return typeof value === 'string' && value.length <= maxLength;
}

function registerIpcHandlers(kbLocker) {
  progressManager = new ProgressManager();
  settingsManager = new SettingsManager();
  keyboardLocker = kbLocker;

  // === Activity Management ===

  ipcMain.handle('start-activity', (_event, activityName) => {
    if (!validateString(activityName, 50) || !VALID_ACTIVITIES.has(activityName)) {
      return { success: false, error: 'Invalid activity name' };
    }

    if (currentActivity) {
      // Stop previous activity
      if (keyboardLocker) keyboardLocker.disable();
    }

    currentActivity = activityName;

    // Enable keyboard lock if setting is on
    const settings = settingsManager.getAll();
    if (settings.keyboard_lock_enabled && keyboardLocker) {
      keyboardLocker.enable();
    }

    return {
      success: true,
      activity: activityName,
      message: `Activity ${activityName} started successfully`
    };
  });

  ipcMain.handle('stop-activity', () => {
    currentActivity = null;
    if (keyboardLocker) keyboardLocker.disable();
    return { success: true, message: 'Activity stopped successfully' };
  });

  // === Voice/Audio (handled in renderer via Web Speech API) ===

  ipcMain.handle('speak', (_event, text, _interrupt) => {
    if (!validateString(text, MAX_TEXT_LENGTH)) {
      return { success: false, error: 'Invalid text input' };
    }
    const settings = settingsManager.getAll();
    if (!settings.voice_enabled) {
      return { success: false, message: 'Voice disabled' };
    }
    // TTS is handled client-side via Web Speech API + dino-voice.js
    return { success: true };
  });

  ipcMain.handle('speak-text', (_event, text) => {
    if (!validateString(text, MAX_TEXT_LENGTH)) {
      return { success: false, error: 'Invalid text input' };
    }
    return { success: true };
  });

  ipcMain.handle('toggle-voice', () => {
    const settings = settingsManager.getAll();
    const newEnabled = !settings.voice_enabled;
    settingsManager.set('voice_enabled', newEnabled);
    return { success: true, voice_enabled: newEnabled, muted: !newEnabled };
  });

  ipcMain.handle('set-voice-enabled', (_event, enabled) => {
    settingsManager.set('voice_enabled', !!enabled);
    return { success: true, voice_enabled: !!enabled };
  });

  ipcMain.handle('set-muted', (_event, muted) => {
    settingsManager.set('voice_enabled', !muted);
    return { success: true, muted: !!muted };
  });

  // === Settings ===

  ipcMain.handle('save-settings', (_event, settings) => {
    if (!settings || typeof settings !== 'object') {
      return { success: false, error: 'Invalid settings format' };
    }

    const allowedKeys = new Set(['theme', 'fullscreen', 'voice_enabled', 'dino_voice_enabled', 'keyboard_lock_enabled', 'volume']);
    const validated = {};

    for (const [key, value] of Object.entries(settings)) {
      if (!allowedKeys.has(key)) continue;

      if (key === 'theme' && !VALID_THEMES.has(value)) continue;
      if (['fullscreen', 'voice_enabled', 'dino_voice_enabled', 'keyboard_lock_enabled'].includes(key) && typeof value !== 'boolean') continue;
      if (key === 'volume' && (typeof value !== 'number' || value < 0 || value > 1)) continue;

      validated[key] = value;
    }

    for (const [key, value] of Object.entries(validated)) {
      settingsManager.set(key, value);
    }

    return { success: true, message: 'Settings saved successfully' };
  });

  ipcMain.handle('load-settings', () => {
    return { success: true, settings: settingsManager.getAll() };
  });

  // === Letters & Numbers ===

  ipcMain.handle('get-random-letter-or-number', () => {
    const isLetter = Math.random() < 0.5;
    let char, voiceText, charType;

    if (isLetter) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      char = letters[Math.floor(Math.random() * letters.length)];
      voiceText = `Press the letter ${char} on the keyboard`;
      charType = 'letter';
    } else {
      char = String(Math.floor(Math.random() * 10));
      voiceText = `Press the number ${char} on the keyboard`;
      charType = 'number';
    }

    return {
      success: true,
      character: char,
      type: charType,
      voice_text: voiceText
    };
  });

  ipcMain.handle('check-letter-number-answer', (_event, pressedKey, expectedKey) => {
    // Input validation
    for (const key of [pressedKey, expectedKey]) {
      if (!validateString(key, MAX_KEY_LENGTH)) {
        return { success: false, error: 'Invalid key input' };
      }
      if (!ALPHANUMERIC_RE.test(key.trim())) {
        return { success: false, error: 'Invalid key characters' };
      }
    }

    const pressed = pressedKey.toUpperCase().trim();
    const expected = expectedKey.toUpperCase().trim();
    const isCorrect = pressed === expected;

    const result = {
      success: true,
      correct: isCorrect,
      pressed_key: pressedKey,
      expected_key: expectedKey
    };

    if (isCorrect) {
      const { starAwarded, levelUp } = progressManager.awardStar('letters_numbers');
      if (starAwarded) {
        result.star_awarded = true;
        result.total_stars = progressManager.totalStars;
        result.level = progressManager.currentLevel;
        result.level_up = levelUp;

        // Build encouragement message (spoken client-side)
        let message = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        if (levelUp) {
          message = `${message} Level up! You're now level ${result.level}!`;
        }
        result.encouragement = message;
      }
    }

    return result;
  });

  // === Progress/Gamification ===

  ipcMain.handle('get-progress', () => {
    return { success: true, progress: progressManager.getProgressSummary() };
  });

  ipcMain.handle('award-stars', (_event, activity, count = 1) => {
    if (!VALID_ACTIVITIES.has(activity)) {
      return { success: false, error: 'Invalid activity' };
    }
    if (typeof count !== 'number' || count < 0 || count > 10) {
      return { success: false, error: 'Invalid star count' };
    }

    progressManager.awardStars(activity, count);
    return {
      success: true,
      stars_awarded: count,
      total_stars: progressManager.totalStars
    };
  });

  // === Character Control (frontend-only, just acknowledge) ===

  ipcMain.handle('play-character-animation', (_event, animationName, loop) => {
    return { success: true, animation: animationName, loop };
  });

  ipcMain.handle('set-character-emotion', (_event, emotion) => {
    return { success: true, emotion };
  });

  ipcMain.handle('character-start-talking', () => {
    return { success: true };
  });

  ipcMain.handle('character-stop-talking', () => {
    return { success: true };
  });

  // === System ===

  ipcMain.handle('get-version', () => {
    return APP_VERSION;
  });

  ipcMain.handle('get-system-info', () => {
    return {
      success: true,
      version: APP_VERSION,
      platform: process.platform,
      electron_version: process.versions.electron,
      current_activity: currentActivity,
      keyboard_lock_available: process.platform === 'win32'
    };
  });
}

module.exports = { registerIpcHandlers };
