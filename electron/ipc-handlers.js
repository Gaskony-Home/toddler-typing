const { ipcMain } = require('electron');
const { ProgressManager } = require('./modules/progress-manager');
const { SettingsManager } = require('./modules/settings-manager');

// Security constants
const MAX_KEY_LENGTH = 10;
const VALID_ACTIVITIES = new Set(['letters_numbers', 'drawing', 'colors_shapes', 'coloring', 'dot2dot', 'sounds', 'typing_game']);
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
      if (keyboardLocker) keyboardLocker.disable();
    }

    currentActivity = activityName;

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

        let message = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        if (levelUp) {
          message = `${message} Level up! You're now level ${result.level}!`;
        }
        result.encouragement = message;
      }
    }

    return result;
  });

  // === Typing Game ===

  const TYPING_WORDS = [
    'CAT','DOG','SUN','HAT','CUP','BIG','RUN','FUN','RED','BED',
    'MOP','TOP','HOP','PIG','BAT','BUS','MUD','HUG','BUG','JAM',
    'PAN','VAN','MAP'
  ];

  ipcMain.handle('get-typing-challenge', (_event, stage) => {
    if (typeof stage !== 'number' || stage < 1 || stage > 3) {
      stage = 1;
    }

    let target, type;

    if (stage === 1) {
      // Letters only
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      target = letters[Math.floor(Math.random() * letters.length)];
      type = 'letter';
    } else if (stage === 2) {
      // Letters and numbers
      const isLetter = Math.random() < 0.5;
      if (isLetter) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        target = letters[Math.floor(Math.random() * letters.length)];
        type = 'letter';
      } else {
        target = String(Math.floor(Math.random() * 10));
        type = 'number';
      }
    } else {
      // Words
      target = TYPING_WORDS[Math.floor(Math.random() * TYPING_WORDS.length)];
      type = 'word';
    }

    return { success: true, target, type, stage };
  });

  ipcMain.handle('check-typing-answer', (_event, pressedKey, expectedKey) => {
    for (const key of [pressedKey, expectedKey]) {
      if (!validateString(key, MAX_KEY_LENGTH)) {
        return { success: false, error: 'Invalid key input' };
      }
    }

    const pressed = pressedKey.toUpperCase().trim();
    const expected = expectedKey.toUpperCase().trim();
    const isCorrect = pressed === expected;

    const result = { success: true, correct: isCorrect };

    if (isCorrect) {
      const { starAwarded, levelUp } = progressManager.awardStar('typing_game');
      if (starAwarded) {
        result.star_awarded = true;
        result.total_stars = progressManager.totalStars;
        result.level = progressManager.currentLevel;
        result.level_up = levelUp;
      }
    }

    return result;
  });

  ipcMain.handle('get-typing-game-progress', () => {
    const activityStars = progressManager.starsByActivity.typing_game || 0;
    return {
      success: true,
      activity_stars: activityStars,
      total_stars: progressManager.totalStars,
      current_level: progressManager.currentLevel,
      stage2_unlocked: activityStars >= 20,
      stage3_unlocked: activityStars >= 50
    };
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
