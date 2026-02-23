/**
 * DinoVoice - Dual-engine TTS with dinosaur voice effects
 *
 * Primary engine: PocketTTS voice cloning (via sherpa-onnx in main process)
 * with Web Audio effects chain — gentle warmth and light reverb.
 *
 * Fallback engine: Web Speech API with low pitch/rate settings (for Android
 * or when PocketTTS is unavailable).
 *
 * Public API unchanged: { speak, stop, init, speakPhrase }
 */

(function () {
  'use strict';

  // ───── Web Speech API fallback setup ─────

  const synth = window.speechSynthesis;

  const DINO_PITCH = 0.6;
  const DINO_RATE = 0.72;
  const DINO_VOLUME = 1.0;

  let selectedVoice = null;
  let webSpeechReady = false;

  function selectVoice() {
    if (!synth) return null;
    const voices = synth.getVoices();
    if (!voices.length) return null;

    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const maleNames = ['david', 'mark', 'james', 'george', 'daniel', 'male'];
    for (const voice of englishVoices) {
      const nameLower = voice.name.toLowerCase();
      if (maleNames.some(m => nameLower.includes(m))) return voice;
    }
    if (englishVoices.length > 0) return englishVoices[0];
    return voices[0];
  }

  function initWebSpeech() {
    if (!synth) return;
    const voices = synth.getVoices();
    if (voices.length > 0) {
      selectedVoice = selectVoice();
      webSpeechReady = true;
    } else {
      synth.addEventListener('voiceschanged', () => {
        if (!webSpeechReady) {
          selectedVoice = selectVoice();
          webSpeechReady = true;
        }
      }, { once: true });
    }
  }

  // ───── PocketTTS + Web Audio effects engine ─────

  let usePocketTTS = false;
  let audioCtx = null;
  let convolverNode = null;
  let currentSource = null;
  let initialized = false;

  // Effects chain parameters — light touch since voice cloning preserves character:
  // PocketTTS clones the reference voice directly, so we only add subtle warmth
  const PLAYBACK_RATE = 1.0;          // No pitch shift needed (voice is already cloned)
  const LOWPASS_FREQ = 8000;          // Very gentle high cut, keep it natural
  const BASS_FREQ = 200;             // Subtle warmth
  const BASS_GAIN = 1;               // +1dB gentle body
  const REVERB_DURATION = 0.2;       // Tiny reverb for slight depth
  const MASTER_GAIN = 0.95;          // Final volume

  /**
   * Generate a synthetic room impulse response (no external files needed).
   * Creates exponential-decay random noise in stereo.
   */
  function createRoomImpulse(ctx, duration) {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    return impulse;
  }

  /**
   * Build the persistent effects chain (reused across all utterances).
   * Chain: source → lowpass → bass boost → dry/wet reverb → gain → destination
   */
  function buildEffectsChain() {
    if (!audioCtx) return null;

    // Gentle lowpass — keeps voice natural, just softens harsh edges
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = LOWPASS_FREQ;

    // Subtle bass boost — adds slight warmth
    const bassBoost = audioCtx.createBiquadFilter();
    bassBoost.type = 'peaking';
    bassBoost.frequency.value = BASS_FREQ;
    bassBoost.gain.value = BASS_GAIN;
    bassBoost.Q.value = 1.0;

    // Light room reverb via convolver
    convolverNode = audioCtx.createConvolver();
    convolverNode.buffer = createRoomImpulse(audioCtx, REVERB_DURATION);

    // Dry/wet mixer: mostly dry, hint of reverb
    const dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.85;
    const wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.15;

    // Master gain
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = MASTER_GAIN;

    // Wire up: lowpass → bassBoost → split(dry + wet reverb) → masterGain → output
    lowpass.connect(bassBoost);

    // Dry path
    bassBoost.connect(dryGain);
    dryGain.connect(masterGain);

    // Wet path (through reverb)
    bassBoost.connect(convolverNode);
    convolverNode.connect(wetGain);
    wetGain.connect(masterGain);

    masterGain.connect(audioCtx.destination);

    return lowpass; // Return the entry point of the chain
  }

  let effectsChainEntry = null;

  // ───── Initialization ─────

  async function init() {
    if (initialized) return;

    // Always prepare Web Speech API as fallback
    initWebSpeech();

    // Try to use PocketTTS (only available in Electron)
    if (window.electronAPI && typeof window.electronAPI.ttsIsAvailable === 'function') {
      try {
        const available = await window.electronAPI.ttsIsAvailable();
        if (available) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          effectsChainEntry = buildEffectsChain();
          usePocketTTS = true;
          console.log('[DinoVoice] PocketTTS voice cloning active');
        }
      } catch (err) {
        console.warn('[DinoVoice] PocketTTS check failed:', err.message);
      }
    }

    if (!usePocketTTS) {
      console.log('[DinoVoice] Using Web Speech API fallback, voice:', selectedVoice?.name || 'default');
    }

    initialized = true;
  }

  // ───── Character animation helpers ─────

  function startSpeakingAnimation() {
    if (window.characterManager) {
      window.characterManager.isSpeaking = true;
      if (window.characterManager.playAnimation) {
        window.characterManager.playAnimation('talk', true);
      }
    }
  }

  function stopSpeakingAnimation() {
    if (window.characterManager) {
      window.characterManager.isSpeaking = false;
      if (window.characterManager.playAnimation) {
        window.characterManager.playAnimation('idle');
      }
    }
  }

  // ───── PocketTTS speak path ─────

  async function speakWithPocketTTS(text) {
    // Resume AudioContext if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Stop any current playback
    if (currentSource) {
      try { currentSource.stop(); } catch (_) { /* already stopped */ }
      currentSource = null;
    }

    // Request audio from main process (speed 0.9 for slight dino drawl)
    const result = await window.electronAPI.ttsSpeak({ text, speed: 0.9 });
    if (!result || !result.available || !result.samples) {
      speakWithWebSpeech(text);
      return;
    }

    // Convert ArrayBuffer to Float32Array
    const samples = new Float32Array(result.samples);
    const sampleRate = result.sampleRate;

    // Create AudioBuffer from PCM data
    const audioBuffer = audioCtx.createBuffer(1, samples.length, sampleRate);
    audioBuffer.getChannelData(0).set(samples);

    // Create source and connect through effects chain
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = PLAYBACK_RATE;
    source.connect(effectsChainEntry);

    // Animation sync
    startSpeakingAnimation();

    source.onended = () => {
      if (currentSource === source) {
        currentSource = null;
        stopSpeakingAnimation();
      }
    };

    currentSource = source;
    source.start(0);
  }

  // ───── Web Speech API speak path (fallback) ─────

  function preprocessText(text) {
    let processed = text.replace(/\.\./g, ', ,');
    processed = processed.replace(/!/g, '! ,');
    return processed;
  }

  function speakWithWebSpeech(text) {
    if (!synth) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(preprocessText(text));
    utterance.pitch = DINO_PITCH;
    utterance.rate = DINO_RATE;
    utterance.volume = DINO_VOLUME;

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = startSpeakingAnimation;
    utterance.onend = stopSpeakingAnimation;
    utterance.onerror = stopSpeakingAnimation;

    synth.speak(utterance);
  }

  // ───── Public API ─────

  function speak(text, interrupt = false) {
    if (!text || typeof text !== 'string') return;
    if (!initialized) init();

    if (interrupt) stop();

    if (usePocketTTS) {
      speakWithPocketTTS(text).catch(err => {
        console.warn('[DinoVoice] PocketTTS speak failed, falling back:', err.message);
        speakWithWebSpeech(text);
      });
    } else {
      speakWithWebSpeech(text);
    }
  }

  function stop() {
    // Stop PocketTTS audio
    if (currentSource) {
      try { currentSource.stop(); } catch (_) { /* already stopped */ }
      currentSource = null;
    }
    stopSpeakingAnimation();

    // Stop Web Speech (covers fallback path)
    if (synth) synth.cancel();
  }

  function speakPhrase(category, subcategory, replacements, interrupt = false) {
    if (typeof window.DinoPhrase !== 'function') return;
    const text = window.DinoPhrase(category, subcategory, replacements);
    if (text) speak(text, interrupt);
  }

  // Auto-init
  init();

  // Expose globally
  window.DinoVoice = { speak, stop, init, speakPhrase };
})();
