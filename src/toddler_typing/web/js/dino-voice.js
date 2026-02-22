/**
 * DinoVoice - Web Speech API TTS with dinosaur-like pitch/rate
 *
 * Replaces Python pyttsx3+pydub pitch-shifting with browser-native
 * SpeechSynthesis. Uses low pitch + slow rate + male voice selection
 * to create a fun, deep "dinosaur" voice effect.
 *
 * Works offline on Windows (uses SAPI5 voices), macOS (uses AVSpeechSynthesis),
 * and Linux (uses espeak/speech-dispatcher).
 */

(function () {
  'use strict';

  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn('[DinoVoice] Web Speech API not available');
    window.DinoVoice = { speak: () => {}, stop: () => {}, init: () => {} };
    return;
  }

  // Configuration for the "dinosaur" voice
  const DINO_PITCH = 0.6;   // Lower pitch for deep voice (0.0 - 2.0)
  const DINO_RATE = 0.85;    // Slightly slower for friendliness (0.1 - 10.0)
  const DINO_VOLUME = 1.0;

  let selectedVoice = null;
  let initialized = false;

  /**
   * Select the best voice for the dinosaur effect.
   * Prefers male, English voices for the deepest natural sound.
   */
  function selectVoice() {
    const voices = synth.getVoices();
    if (!voices.length) return null;

    // Priority: male English voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    // Try to find a male voice (common names across platforms)
    const maleNames = ['david', 'mark', 'james', 'george', 'daniel', 'male'];
    for (const voice of englishVoices) {
      const nameLower = voice.name.toLowerCase();
      if (maleNames.some(m => nameLower.includes(m))) {
        return voice;
      }
    }

    // Fall back to any English voice
    if (englishVoices.length > 0) return englishVoices[0];

    // Last resort: any voice
    return voices[0];
  }

  function init() {
    if (initialized) return;

    // Voices may load asynchronously
    const voices = synth.getVoices();
    if (voices.length > 0) {
      selectedVoice = selectVoice();
      initialized = true;
      console.log('[DinoVoice] Initialized with voice:', selectedVoice?.name || 'default');
    } else {
      // Wait for voices to load
      synth.addEventListener('voiceschanged', () => {
        if (!initialized) {
          selectedVoice = selectVoice();
          initialized = true;
          console.log('[DinoVoice] Voices loaded, selected:', selectedVoice?.name || 'default');
        }
      }, { once: true });
    }
  }

  /**
   * Speak text with dinosaur voice effect.
   * @param {string} text - Text to speak
   * @param {boolean} [interrupt=false] - Cancel current speech first
   */
  function speak(text, interrupt = false) {
    if (!synth) return;
    if (!text || typeof text !== 'string') return;

    // Ensure initialized
    if (!initialized) init();

    if (interrupt) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = DINO_PITCH;
    utterance.rate = DINO_RATE;
    utterance.volume = DINO_VOLUME;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Notify character manager about speech start/end
    utterance.onstart = () => {
      if (window.characterManager) {
        window.characterManager.isSpeaking = true;
        if (window.characterManager.playAnimation) {
          window.characterManager.playAnimation('talk', true);
        }
      }
    };
    utterance.onend = () => {
      if (window.characterManager) {
        window.characterManager.isSpeaking = false;
        if (window.characterManager.playAnimation) {
          window.characterManager.playAnimation('idle');
        }
      }
    };
    utterance.onerror = () => {
      if (window.characterManager) {
        window.characterManager.isSpeaking = false;
      }
    };

    synth.speak(utterance);
  }

  function stop() {
    if (synth) synth.cancel();
  }

  // Auto-init
  init();

  // Expose globally
  window.DinoVoice = { speak, stop, init };
})();
