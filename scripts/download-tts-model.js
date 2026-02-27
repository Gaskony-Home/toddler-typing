/**
 * Download PocketTTS voice cloning model for dinosaur voice
 * Downloads sherpa-onnx-pocket-tts-int8 from sherpa-onnx GitHub releases
 *
 * Usage: node scripts/download-tts-model.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const MODEL_URL = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/sherpa-onnx-pocket-tts-int8-2026-01-26.tar.bz2';
const MODEL_DIR = path.join(__dirname, '..', 'resources', 'tts-model');
const ARCHIVE_NAME = 'sherpa-onnx-pocket-tts-int8-2026-01-26.tar.bz2';

// PocketTTS INT8 model files
const REQUIRED_FILES = [
  'lm_flow.int8.onnx',
  'lm_main.int8.onnx',
  'encoder.onnx',
  'decoder.int8.onnx',
  'text_conditioner.onnx',
  'vocab.json',
  'token_scores.json',
];

async function downloadModel() {
  // Check if model already exists
  const allPresent = REQUIRED_FILES.every(f =>
    fs.existsSync(path.join(MODEL_DIR, f))
  );
  if (allPresent) {
    console.log('[setup:tts] PocketTTS model already downloaded, skipping.');
    // Still copy reference voice if missing
    const refSrc = path.join(__dirname, '..', 'resources', 'voice', 'reference-voice.wav');
    const refDst = path.join(MODEL_DIR, 'reference-voice.wav');
    if (fs.existsSync(refSrc) && !fs.existsSync(refDst)) {
      fs.copyFileSync(refSrc, refDst);
      console.log('[setup:tts] Reference voice copied to tts-model/');
    }
    return;
  }

  // Create target directory
  fs.mkdirSync(MODEL_DIR, { recursive: true });

  const archivePath = path.join(MODEL_DIR, ARCHIVE_NAME);

  // Download
  console.log('[setup:tts] Downloading PocketTTS INT8 model...');
  console.log(`[setup:tts] URL: ${MODEL_URL}`);
  console.log('[setup:tts] This may take a few minutes (~93MB)...');

  const response = await fetch(MODEL_URL, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
  let downloadedBytes = 0;
  let lastPercent = -1;

  // Create a transform to track progress
  const progressTransform = new TransformStream({
    transform(chunk, controller) {
      downloadedBytes += chunk.byteLength;
      if (totalBytes > 0) {
        const percent = Math.floor((downloadedBytes / totalBytes) * 100);
        if (percent !== lastPercent && percent % 10 === 0) {
          console.log(`[setup:tts] Downloaded ${percent}%`);
          lastPercent = percent;
        }
      }
      controller.enqueue(chunk);
    }
  });

  const progressStream = response.body.pipeThrough(progressTransform);
  await pipeline(
    Readable.fromWeb(progressStream),
    fs.createWriteStream(archivePath)
  );
  console.log('[setup:tts] Download complete.');

  // Extract (strip top-level directory so files go directly into MODEL_DIR)
  console.log('[setup:tts] Extracting model files...');
  execSync(`tar -xjf "${ARCHIVE_NAME}" --strip-components=1`, {
    cwd: MODEL_DIR,
    stdio: 'inherit'
  });

  // Clean up archive
  fs.unlinkSync(archivePath);

  // Verify extraction
  const missing = REQUIRED_FILES.filter(f =>
    !fs.existsSync(path.join(MODEL_DIR, f))
  );
  if (missing.length > 0) {
    throw new Error(`Extraction failed: missing files: ${missing.join(', ')}`);
  }

  // Copy reference voice for voice cloning (tracked in git, not part of model tarball)
  const refSource = path.join(__dirname, '..', 'resources', 'voice', 'reference-voice.wav');
  const refDest = path.join(MODEL_DIR, 'reference-voice.wav');
  if (fs.existsSync(refSource) && !fs.existsSync(refDest)) {
    fs.copyFileSync(refSource, refDest);
    console.log('[setup:tts] Reference voice copied to tts-model/');
  }

  console.log('[setup:tts] PocketTTS model ready at resources/tts-model/');
}

downloadModel().catch(err => {
  console.error('[setup:tts] Error:', err.message);
  process.exit(1);
});
