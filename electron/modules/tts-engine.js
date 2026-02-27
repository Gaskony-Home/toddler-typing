/**
 * TtsEngine - Non-blocking PocketTTS voice cloning via worker thread
 *
 * Runs TTS generation in a worker thread to avoid blocking the main process.
 * Includes an LRU cache so repeated phrases are returned instantly.
 */

const path = require('path');
const fs = require('fs');
const { Worker } = require('worker_threads');

// Cache up to 50 phrases (~50 * 100KB = ~5MB memory)
const CACHE_MAX = 50;

class TtsEngine {
  constructor() {
    this._worker = null;
    this._available = false;
    this._pendingRequests = new Map();
    this._nextId = 0;
    this._cache = new Map(); // LRU cache: key → { samples, sampleRate, duration }
    this._modelDir = null;
    this._init();
  }

  _resolveModelDir() {
    const checkFile = 'lm_main.int8.onnx';

    if (process.resourcesPath) {
      const packagedPath = path.join(process.resourcesPath, 'tts-model');
      if (fs.existsSync(path.join(packagedPath, checkFile))) return packagedPath;
    }

    const devPath = path.join(__dirname, '..', '..', 'resources', 'tts-model');
    if (fs.existsSync(path.join(devPath, checkFile))) return devPath;

    return null;
  }

  _init() {
    try {
      this._modelDir = this._resolveModelDir();
      if (!this._modelDir) {
        console.warn('[TtsEngine] Model files not found, PocketTTS unavailable');
        return;
      }

      // Worker must run from unpacked path in production (asar can't run workers)
      let workerPath = path.join(__dirname, 'tts-worker.js');
      workerPath = workerPath.replace('app.asar', 'app.asar.unpacked');
      this._worker = new Worker(workerPath, {
        workerData: { modelDir: this._modelDir },
      });

      this._worker.on('message', (msg) => {
        const pending = this._pendingRequests.get(msg.id);
        if (pending) {
          this._pendingRequests.delete(msg.id);
          if (msg.error) {
            pending.reject(new Error(msg.error));
          } else if (msg.available !== undefined) {
            pending.resolve(msg.available);
          } else if (msg.warmedUp) {
            pending.resolve(true);
          } else {
            pending.resolve({
              samples: new Float32Array(msg.samples),
              sampleRate: msg.sampleRate,
              duration: msg.duration,
            });
          }
        }
      });

      this._worker.on('error', (err) => {
        console.error('[TtsEngine] Worker error:', err.message);
        // Reject all pending requests
        for (const [id, pending] of this._pendingRequests) {
          pending.reject(err);
        }
        this._pendingRequests.clear();
      });

      this._worker.on('exit', (code) => {
        if (code !== 0) {
          console.warn(`[TtsEngine] Worker exited with code ${code}`);
        }
        this._available = false;
      });

      this._available = true;
      console.log('[TtsEngine] Worker thread started');
    } catch (err) {
      console.warn('[TtsEngine] Failed to start worker:', err.message);
      this._available = false;
    }
  }

  isAvailable() {
    return this._available;
  }

  /**
   * Cache key: normalized text + speed
   */
  _cacheKey(text, speed) {
    return `${speed}:${text}`;
  }

  /**
   * LRU cache get — moves accessed entry to end (most recent)
   */
  _cacheGet(key) {
    if (!this._cache.has(key)) return null;
    const value = this._cache.get(key);
    // Move to end (most recently used)
    this._cache.delete(key);
    this._cache.set(key, value);
    return value;
  }

  /**
   * LRU cache set — evicts oldest entry if at capacity
   */
  _cacheSet(key, value) {
    if (this._cache.has(key)) {
      this._cache.delete(key);
    } else if (this._cache.size >= CACHE_MAX) {
      // Delete oldest entry (first key)
      const oldestKey = this._cache.keys().next().value;
      this._cache.delete(oldestKey);
    }
    this._cache.set(key, value);
  }

  /**
   * Generate speech audio from text (non-blocking, returns a Promise).
   * Returns cached result instantly if available.
   */
  async generate(text, speed = 1.0) {
    if (!this._available || !this._worker) {
      throw new Error('TTS engine not available');
    }

    // Check cache first
    const key = this._cacheKey(text, speed);
    const cached = this._cacheGet(key);
    if (cached) {
      return {
        samples: new Float32Array(cached.samples), // Copy so caller can transfer
        sampleRate: cached.sampleRate,
        duration: cached.duration,
      };
    }

    // Send to worker thread
    const id = this._nextId++;
    return new Promise((resolve, reject) => {
      this._pendingRequests.set(id, {
        resolve: (result) => {
          // Store in cache (keep a copy since samples.buffer gets transferred)
          this._cacheSet(key, {
            samples: new Float32Array(result.samples),
            sampleRate: result.sampleRate,
            duration: result.duration,
          });
          resolve(result);
        },
        reject,
      });
      this._worker.postMessage({ type: 'generate', id, text, speed });
    });
  }

  /**
   * Warm up the engine with a short generation.
   */
  async warmup() {
    if (!this._available || !this._worker) return;
    const id = this._nextId++;
    return new Promise((resolve) => {
      this._pendingRequests.set(id, { resolve, reject: () => resolve(false) });
      this._worker.postMessage({ type: 'warmup', id });
    });
  }

  /**
   * Clean up worker on shutdown
   */
  destroy() {
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
    this._cache.clear();
    this._pendingRequests.clear();
  }
}

module.exports = { TtsEngine };
