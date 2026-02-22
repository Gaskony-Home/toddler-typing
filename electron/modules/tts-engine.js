/**
 * TtsEngine - Piper TTS via sherpa-onnx for high-quality dinosaur voice
 *
 * Wraps sherpa-onnx's OfflineTts to generate PCM audio from text.
 * Falls back gracefully if the native module or model files are unavailable.
 */

const path = require('path');
const fs = require('fs');

class TtsEngine {
  constructor() {
    this._tts = null;
    this._available = false;
    this._init();
  }

  _init() {
    try {
      // Resolve model directory: packaged app vs dev
      const modelDir = this._resolveModelDir();
      if (!modelDir) {
        console.warn('[TtsEngine] Model files not found, Piper TTS unavailable');
        return;
      }

      const { OfflineTts } = require('sherpa-onnx-node');

      const config = {
        model: {
          vits: {
            model: path.join(modelDir, 'en_US-joe-medium.onnx'),
            tokens: path.join(modelDir, 'tokens.txt'),
            dataDir: path.join(modelDir, 'espeak-ng-data'),
            noiseScale: 0.667,
            noiseScaleW: 0.8,
            lengthScale: 1.0,
          },
        },
        numThreads: 2,
        maxNumSentences: 2,
      };

      this._tts = new OfflineTts(config);
      this._available = true;
      console.log('[TtsEngine] Piper TTS initialized successfully');
    } catch (err) {
      console.warn('[TtsEngine] Failed to initialize Piper TTS:', err.message);
      this._available = false;
    }
  }

  _resolveModelDir() {
    const modelFile = 'en_US-joe-medium.onnx';

    // Packaged app: resources are in process.resourcesPath
    if (process.resourcesPath) {
      const packagedPath = path.join(process.resourcesPath, 'tts-model');
      if (fs.existsSync(path.join(packagedPath, modelFile))) {
        return packagedPath;
      }
    }

    // Development: resources are relative to project root
    const devPath = path.join(__dirname, '..', '..', 'resources', 'tts-model');
    if (fs.existsSync(path.join(devPath, modelFile))) {
      return devPath;
    }

    return null;
  }

  isAvailable() {
    return this._available;
  }

  /**
   * Generate speech audio from text.
   * @param {string} text - Text to synthesize
   * @param {number} [speed=0.85] - Speech speed (lower = slower)
   * @returns {{ samples: Float32Array, sampleRate: number }} PCM audio data
   */
  generate(text, speed = 0.85) {
    if (!this._available || !this._tts) {
      throw new Error('TTS engine not available');
    }

    // Preprocess: convert ".." to SSML-like pauses
    let processed = text.replace(/\.\./g, '. . .');
    processed = processed.replace(/!/g, '! ');

    const audio = this._tts.generate({
      text: processed,
      sid: 0,
      speed: speed,
      enableExternalBuffer: false,
    });

    return {
      samples: audio.samples,
      sampleRate: audio.sampleRate,
    };
  }

  /**
   * Warm up the engine with a short silent generation to reduce first-call latency.
   */
  warmup() {
    if (!this._available) return;
    try {
      this._tts.generate({ text: '.', sid: 0, speed: 1.0, enableExternalBuffer: false });
      console.log('[TtsEngine] Warmup complete');
    } catch (err) {
      console.warn('[TtsEngine] Warmup failed:', err.message);
    }
  }
}

module.exports = { TtsEngine };
