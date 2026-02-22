/**
 * API Bridge - Provides window.appBridge to the active backend
 *
 * Priority: electronAPI (Electron) > Android (Kotlin WebView) > graceful degradation
 *
 * TTS is handled entirely client-side via DinoVoice (Web Speech API).
 * Character animations are handled client-side by the character managers.
 */

(function () {
  'use strict';

  // Detect available backend
  const hasElectron = typeof window.electronAPI !== 'undefined';
  const hasAndroid = typeof window.Android !== 'undefined';

  const api = {};

  if (hasElectron) {
    console.log('[api-bridge] Using Electron backend');
    const e = window.electronAPI;

    // Activity management
    api.start_activity = (activityName) => e.startActivity(activityName);
    api.stop_activity = () => e.stopActivity();

    // Voice - client-side TTS via DinoVoice
    api.speak = async (text, interrupt = false) => {
      if (window.DinoVoice && !window.AppState?.isMuted) {
        window.DinoVoice.speak(text, interrupt);
      }
      return { success: true };
    };

    // Settings
    api.save_settings = (settings) => e.saveSettings(settings);
    api.load_settings = () => e.loadSettings();

    // Letters & Numbers
    api.get_random_letter_or_number = async () => {
      return await e.getRandomLetterOrNumber();
    };
    api.check_letter_number_answer = async (pressedKey, expectedKey) => {
      return await e.checkLetterNumberAnswer(pressedKey, expectedKey);
    };

    // Typing Game
    api.get_typing_challenge = async (stage) => {
      return await e.getTypingChallenge(stage);
    };
    api.check_typing_answer = async (pressedKey, expectedKey, stage) => {
      return await e.checkTypingAnswer(pressedKey, expectedKey, stage);
    };
    api.get_typing_game_progress = async () => {
      return await e.getTypingGameProgress();
    };

    // Progress/Gamification
    api.get_progress = () => e.getProgress();
    api.award_stars = (activity, count) => e.awardStars(activity, count);

    // System
    api.get_version = () => e.getVersion();
    api.get_system_info = () => e.getSystemInfo();

  } else if (hasAndroid) {
    console.log('[api-bridge] Using Android backend');
    const a = window.Android;

    // Android JavascriptInterface methods return strings; wrap them
    const callAndroid = (method, ...args) => {
      try {
        const result = a[method](...args);
        return typeof result === 'string' ? JSON.parse(result) : result;
      } catch (err) {
        console.error(`[api-bridge] Android.${method} failed:`, err);
        return null;
      }
    };

    api.speak = (text, interrupt) => {
      if (window.DinoVoice && !window.AppState?.isMuted) {
        window.DinoVoice.speak(text, !!interrupt);
      }
      return { success: true };
    };
    api.start_activity = (name) => callAndroid('startActivity', name);
    api.stop_activity = () => callAndroid('stopActivity');
    api.save_settings = (s) => callAndroid('saveSettings', JSON.stringify(s));
    api.load_settings = () => callAndroid('loadSettings');
    api.get_random_letter_or_number = () => callAndroid('getRandomLetterOrNumber');
    api.check_letter_number_answer = (p, e) => callAndroid('checkLetterNumberAnswer', p, e);
    api.get_typing_challenge = (stage) => callAndroid('getTypingChallenge', stage);
    api.check_typing_answer = (p, e, s) => callAndroid('checkTypingAnswer', p, e, s);
    api.get_typing_game_progress = () => callAndroid('getTypingGameProgress');
    api.get_progress = () => callAndroid('getProgress');
    api.award_stars = (act, cnt) => callAndroid('awardStars', act, cnt);
    api.get_version = () => callAndroid('getVersion');
    api.get_system_info = () => callAndroid('getSystemInfo');

  } else {
    console.warn('[api-bridge] No backend detected - running in browser-only mode');

    // Provide graceful no-op stubs so the app doesn't crash
    const noop = () => Promise.resolve({ success: false, message: 'No backend available' });
    const methods = [
      'start_activity', 'stop_activity',
      'save_settings', 'load_settings',
      'get_random_letter_or_number', 'check_letter_number_answer',
      'get_typing_challenge', 'check_typing_answer', 'get_typing_game_progress',
      'get_progress', 'award_stars',
      'get_version', 'get_system_info'
    ];
    for (const m of methods) {
      api[m] = noop;
    }

    // Even without backend, try client-side TTS
    api.speak = async (text, interrupt) => {
      if (window.DinoVoice) window.DinoVoice.speak(text, interrupt);
      return { success: true };
    };
  }

  window.appBridge = api;
  console.log('[api-bridge] Bridge initialized. appBridge methods:', Object.keys(api).join(', '));
})();
