/**
 * TTS Worker Thread - Runs PocketTTS generation off the main thread
 *
 * Receives { id, text, speed } messages, returns { id, samples, sampleRate, duration }
 * or { id, error } on failure.
 */

const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs');

let tts = null;
let sherpa = null;
let referenceWave = null;
let ttsAvailable = false;

function loadWav(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF') throw new Error('Not a valid WAV file');

  const numChannels = buffer.readUInt16LE(22);
  const sampleRate = buffer.readUInt32LE(24);
  const bitsPerSample = buffer.readUInt16LE(34);

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
          samples[i] = buffer.readInt16LE(dataOffset + i * numChannels * 2) / 32768.0;
        }
      } else if (bitsPerSample === 32) {
        for (let i = 0; i < numSamples; i++) {
          samples[i] = buffer.readFloatLE(dataOffset + i * numChannels * 4);
        }
      }
      return { samples, sampleRate };
    }
    dataOffset += 8 + chunkSize;
  }
  throw new Error('WAV data chunk not found');
}

function normalize(samples, sampleRate, targetPeak = 0.85) {
  const windowSize = Math.floor(sampleRate * 0.05);
  const silenceThreshold = 0.02;
  let trimEnd = samples.length;

  const maxSamples = sampleRate * 10;
  if (trimEnd > maxSamples) trimEnd = maxSamples;

  for (let i = trimEnd - windowSize; i >= 0; i -= windowSize) {
    let sum = 0;
    const end = Math.min(i + windowSize, trimEnd);
    for (let j = i; j < end; j++) sum += samples[j] * samples[j];
    if (Math.sqrt(sum / (end - i)) > silenceThreshold) {
      trimEnd = Math.min(trimEnd, i + windowSize + Math.floor(sampleRate * 0.1));
      break;
    }
  }

  const trimmed = trimEnd < samples.length ? samples.slice(0, trimEnd) : samples;

  let maxAbs = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const abs = Math.abs(trimmed[i]);
    if (abs > maxAbs) maxAbs = abs;
  }
  if (maxAbs < 0.001) return trimmed;

  const gain = targetPeak / maxAbs;
  if (gain > 0.9 && gain < 1.1) return trimmed;

  const normalized = new Float32Array(trimmed.length);
  for (let i = 0; i < trimmed.length; i++) normalized[i] = trimmed[i] * gain;
  return normalized;
}

function preprocessText(text) {
  let processed = text.replace(/(.)\1{2,}/g, '$1$1');
  processed = processed.replace(/([aeiouAEIOU])\1+/g, '$1');
  processed = processed.replace(/\b([Hh])y\b/g, '$1ey');
  processed = processed.replace(/\b([Ll])ok/g, '$1ook');
  processed = processed.replace(/\b([Ss])e\b/g, '$1ee');
  processed = processed.replace(/\b([Kk])ep\b/g, '$1eep');
  processed = processed.replace(/\b([Gg])od\b/g, '$1ood');
  processed = processed.replace(/\b([Ss])on\b/g, '$1oon');
  processed = processed.replace(/\b([Tt])hre\b/g, '$1hree');
  processed = processed.replace(/\.\./g, ',');
  processed = processed.replace(/\s{2,}/g, ' ').trim();
  return processed;
}

function initEngine() {
  try {
    const modelDir = workerData.modelDir;
    if (!modelDir) {
      console.warn('[TtsWorker] No model directory provided');
      return;
    }

    sherpa = require('sherpa-onnx-node');
    const { OfflineTts } = sherpa;

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

    tts = new OfflineTts(config);

    const refPath = path.join(modelDir, 'reference-voice.wav');
    if (fs.existsSync(refPath)) {
      referenceWave = loadWav(refPath);
    }

    ttsAvailable = true;
    console.log('[TtsWorker] Engine initialized');
  } catch (err) {
    console.warn('[TtsWorker] Init failed:', err.message);
    ttsAvailable = false;
  }
}

function generate(text, speed = 1.0) {
  const processed = preprocessText(text);

  const genConfig = {};
  if (referenceWave) {
    genConfig.speed = speed;
    genConfig.referenceAudio = referenceWave.samples;
    genConfig.referenceSampleRate = referenceWave.sampleRate;
    genConfig.numSteps = 20;
    genConfig.extra = { max_reference_audio_len: 12 };
  }

  const generationConfig = new sherpa.GenerationConfig(genConfig);
  const audio = tts.generate({
    text: processed,
    enableExternalBuffer: false,
    generationConfig,
  });

  const sampleRate = tts.sampleRate;
  const samples = normalize(audio.samples, sampleRate);
  return { samples, sampleRate };
}

// Initialize engine on worker start
initEngine();

// Handle messages from main thread
parentPort.on('message', (msg) => {
  if (msg.type === 'generate') {
    if (!ttsAvailable) {
      parentPort.postMessage({ id: msg.id, error: 'TTS not available' });
      return;
    }
    try {
      const { samples, sampleRate } = generate(msg.text, msg.speed || 1.0);
      parentPort.postMessage({
        id: msg.id,
        samples: samples.buffer,
        sampleRate,
        duration: samples.length / sampleRate,
      }, [samples.buffer]); // Transfer buffer for zero-copy
    } catch (err) {
      parentPort.postMessage({ id: msg.id, error: err.message });
    }
  } else if (msg.type === 'warmup') {
    if (!ttsAvailable) return;
    try {
      const genConfig = {};
      if (referenceWave) {
        genConfig.speed = 1.0;
        genConfig.referenceAudio = referenceWave.samples;
        genConfig.referenceSampleRate = referenceWave.sampleRate;
        genConfig.numSteps = 5;
        genConfig.extra = { max_reference_audio_len: 12 };
      }
      const generationConfig = new sherpa.GenerationConfig(genConfig);
      tts.generate({ text: 'Hello.', enableExternalBuffer: false, generationConfig });
      parentPort.postMessage({ id: msg.id, warmedUp: true });
      console.log('[TtsWorker] Warmup complete');
    } catch (err) {
      console.warn('[TtsWorker] Warmup failed:', err.message);
    }
  } else if (msg.type === 'isAvailable') {
    parentPort.postMessage({ id: msg.id, available: ttsAvailable });
  }
});
