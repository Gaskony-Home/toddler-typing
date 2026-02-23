/**
 * TtsEngine - PocketTTS voice cloning via sherpa-onnx
 *
 * Uses PocketTTS (zero-shot voice cloning) with a reference voice recording
 * to generate speech that sounds like the dinosaur character.
 * Falls back gracefully if the native module or model files are unavailable.
 */

const path = require('path');
const fs = require('fs');

class TtsEngine {
  constructor() {
    this._tts = null;
    this._available = false;
    this._referenceWave = null;
    this._sherpa = null;
    this._init();
  }

  _init() {
    try {
      const modelDir = this._resolveModelDir();
      if (!modelDir) {
        console.warn('[TtsEngine] Model files not found, PocketTTS unavailable');
        return;
      }

      this._sherpa = require('sherpa-onnx-node');
      const { OfflineTts } = this._sherpa;

      const config = {
        model: {
          pocket: {
            lmFlow: path.join(modelDir, 'lm_flow.int8.onnx'),
            lmMain: path.join(modelDir, 'lm_main.int8.onnx'),
            encoder: path.join(modelDir, 'encoder.onnx'),
            decoder: path.join(modelDir, 'decoder.int8.onnx'),
            textConditioner: path.join(modelDir, 'text_conditioner.onnx'),
            vocabJson: path.join(modelDir, 'vocab.json'),
            tokenScoresJson: path.join(modelDir, 'token_scores.json'),
          },
          debug: false,
          numThreads: 2,
          provider: 'cpu',
        },
        maxNumSentences: 1,
      };

      console.log('[TtsEngine] Creating OfflineTts with config...');
      this._tts = new OfflineTts(config);
      console.log('[TtsEngine] OfflineTts created successfully');

      // Load reference voice for cloning
      const refPath = path.join(modelDir, 'reference-voice.wav');
      if (fs.existsSync(refPath)) {
        this._referenceWave = this._loadWav(refPath);
        console.log(`[TtsEngine] Reference voice loaded (${this._referenceWave.sampleRate}Hz, ${(this._referenceWave.samples.length / this._referenceWave.sampleRate).toFixed(1)}s)`);
      } else {
        console.warn('[TtsEngine] reference-voice.wav not found, voice cloning disabled');
      }

      this._available = true;
      console.log('[TtsEngine] PocketTTS initialized successfully');
    } catch (err) {
      console.warn('[TtsEngine] Failed to initialize PocketTTS:', err.message);
      this._available = false;
    }
  }

  _resolveModelDir() {
    const checkFile = 'lm_main.int8.onnx';

    // Packaged app: resources are in process.resourcesPath
    if (process.resourcesPath) {
      const packagedPath = path.join(process.resourcesPath, 'tts-model');
      if (fs.existsSync(path.join(packagedPath, checkFile))) {
        return packagedPath;
      }
    }

    // Development: resources are relative to project root
    const devPath = path.join(__dirname, '..', '..', 'resources', 'tts-model');
    if (fs.existsSync(path.join(devPath, checkFile))) {
      return devPath;
    }

    return null;
  }

  /**
   * Load a WAV file manually to avoid sherpa-onnx readWave external buffer issues.
   * Supports 16-bit PCM WAV files.
   */
  _loadWav(filePath) {
    const buffer = fs.readFileSync(filePath);
    // Parse WAV header
    const riff = buffer.toString('ascii', 0, 4);
    if (riff !== 'RIFF') throw new Error('Not a valid WAV file');

    const numChannels = buffer.readUInt16LE(22);
    const sampleRate = buffer.readUInt32LE(24);
    const bitsPerSample = buffer.readUInt16LE(34);

    // Find data chunk
    let dataOffset = 36;
    while (dataOffset < buffer.length - 8) {
      const chunkId = buffer.toString('ascii', dataOffset, dataOffset + 4);
      const chunkSize = buffer.readUInt32LE(dataOffset + 4);
      if (chunkId === 'data') {
        dataOffset += 8;
        const numSamples = Math.floor(chunkSize / (bitsPerSample / 8) / numChannels);
        const samples = new Float32Array(numSamples);

        if (bitsPerSample === 16) {
          for (let i = 0; i < numSamples; i++) {
            const offset = dataOffset + i * numChannels * 2;
            samples[i] = buffer.readInt16LE(offset) / 32768.0;
          }
        } else if (bitsPerSample === 32) {
          for (let i = 0; i < numSamples; i++) {
            const offset = dataOffset + i * numChannels * 4;
            samples[i] = buffer.readFloatLE(offset);
          }
        }

        return { samples, sampleRate };
      }
      dataOffset += 8 + chunkSize;
    }
    throw new Error('WAV data chunk not found');
  }

  isAvailable() {
    return this._available;
  }

  /**
   * Generate speech audio from text using voice cloning.
   * @param {string} text - Text to synthesize
   * @param {number} [speed=1.0] - Speech speed
   * @returns {{ samples: Float32Array, sampleRate: number }} PCM audio data
   */
  generate(text, speed = 1.0) {
    if (!this._available || !this._tts) {
      throw new Error('TTS engine not available');
    }

    // Normalize dino-style text for TTS (elongated vowels confuse neural models)
    // "Weeelcome" → "Welcome", "Ohhh" → "Oh", "Heeey" → "Hey"
    let processed = text.replace(/([a-zA-Z])\1{2,}/g, '$1$1'); // Reduce 3+ repeats to 2
    processed = processed.replace(/([aeiouAEIOU])\1+/g, '$1');   // Reduce repeated vowels to 1
    // Fix common patterns: "Heeey" → "Hey" not "Hy"
    processed = processed.replace(/\b([Hh])y\b/g, '$1ey');
    // Convert ".." pauses to commas for natural speech
    processed = processed.replace(/\.\./g, ',');
    processed = processed.replace(/!/g, '! ');

    const genConfig = {};

    if (this._referenceWave) {
      genConfig.speed = speed;
      genConfig.referenceAudio = this._referenceWave.samples;
      genConfig.referenceSampleRate = this._referenceWave.sampleRate;
      genConfig.numSteps = 20;
      genConfig.extra = { max_reference_audio_len: 12 };
    }

    const generationConfig = new this._sherpa.GenerationConfig(genConfig);

    const audio = this._tts.generate({
      text: processed,
      enableExternalBuffer: false,
      generationConfig,
    });

    return {
      samples: audio.samples,
      sampleRate: audio.sampleRate,
    };
  }

  /**
   * Warm up the engine with a short generation to reduce first-call latency.
   */
  warmup() {
    if (!this._available) return;
    try {
      const genConfig = {};
      if (this._referenceWave) {
        genConfig.speed = 1.0;
        genConfig.referenceAudio = this._referenceWave.samples;
        genConfig.referenceSampleRate = this._referenceWave.sampleRate;
        genConfig.numSteps = 5;
        genConfig.extra = { max_reference_audio_len: 12 };
      }
      const generationConfig = new this._sherpa.GenerationConfig(genConfig);
      this._tts.generate({
        text: 'Hello.',
        enableExternalBuffer: false,
        generationConfig,
      });
      console.log('[TtsEngine] Warmup complete');
    } catch (err) {
      console.warn('[TtsEngine] Warmup failed:', err.message);
    }
  }
}

module.exports = { TtsEngine };
