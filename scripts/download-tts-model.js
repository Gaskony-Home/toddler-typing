/**
 * Download Piper TTS model for dinosaur voice
 * Downloads en_US-joe-medium model from sherpa-onnx GitHub releases
 *
 * Usage: node scripts/download-tts-model.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const MODEL_URL = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-joe-medium.tar.bz2';
const MODEL_DIR = path.join(__dirname, '..', 'resources', 'tts-model');
const ARCHIVE_NAME = 'vits-piper-en_US-joe-medium.tar.bz2';

async function downloadModel() {
  // Check if model already exists
  const modelFile = path.join(MODEL_DIR, 'en_US-joe-medium.onnx');
  if (fs.existsSync(modelFile)) {
    console.log('[setup:tts] Model already downloaded, skipping.');
    return;
  }

  // Create target directory
  fs.mkdirSync(MODEL_DIR, { recursive: true });

  const archivePath = path.join(MODEL_DIR, ARCHIVE_NAME);

  // Download
  console.log('[setup:tts] Downloading Piper TTS model (en_US-joe-medium)...');
  console.log(`[setup:tts] URL: ${MODEL_URL}`);
  console.log('[setup:tts] This may take a few minutes (~63MB)...');

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
  if (!fs.existsSync(modelFile)) {
    throw new Error('Extraction failed: model .onnx file not found');
  }
  if (!fs.existsSync(path.join(MODEL_DIR, 'tokens.txt'))) {
    throw new Error('Extraction failed: tokens.txt not found');
  }
  if (!fs.existsSync(path.join(MODEL_DIR, 'espeak-ng-data'))) {
    throw new Error('Extraction failed: espeak-ng-data directory not found');
  }

  console.log('[setup:tts] Piper TTS model ready at resources/tts-model/');
}

downloadModel().catch(err => {
  console.error('[setup:tts] Error:', err.message);
  process.exit(1);
});
