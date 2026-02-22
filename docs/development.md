# Development Guide

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm

## Setup

```bash
# Install dependencies
npm install

# Run the app
npm start
```

## Project Structure

```
toddler-typing/
├── electron/                      # Main process (Node.js)
│   ├── main.js                   # Window creation, app lifecycle
│   ├── preload.js                # Context bridge (electronAPI)
│   ├── ipc-handlers.js           # IPC message handlers
│   └── modules/
│       ├── progress-manager.js   # Star/level tracking (electron-conf)
│       ├── settings-manager.js   # User preferences (electron-conf)
│       ├── keyboard-locker.js    # System key blocking (Windows)
│       └── auto-updater.js       # GitHub Releases auto-update
├── src/toddler_typing/web/       # Renderer process (browser)
│   ├── index.html                # Main page
│   ├── css/custom.css            # All styles
│   ├── js/
│   │   ├── app.js                # App initialization, managers, UI
│   │   ├── api-bridge.js         # window.appBridge (Electron/Android)
│   │   ├── dino-voice.js         # Web Speech API TTS
│   │   ├── character_manager.js  # 3D character (Three.js + GLTFLoader)
│   │   ├── character_manager_2d.js # 2D CSS-animated fallback
│   │   ├── character-setup.js    # Character manager init logic
│   │   └── activities/           # One file per activity
│   ├── assets/                   # Images, SVGs, dot2dot, colouring
│   └── libs/                     # Vendored: Bootstrap, Three.js, fonts
├── android/                      # Android WebView wrapper
├── forge.config.js               # Electron Forge packaging config
└── package.json
```

## Architecture

### Communication Flow

```
Frontend (renderer)  <-->  api-bridge.js (window.appBridge)
                              |
                     electronAPI (preload.js)
                              |
                     ipc-handlers.js (main process)
                              |
                     electron-conf (persistence)
```

- **TTS**: Handled entirely client-side via `dino-voice.js` (Web Speech API)
- **Character animations**: Handled client-side by character managers
- **Settings/Progress**: Persisted via `electron-conf` in main process

### Key Patterns

- `AppAPI` object in `app.js` wraps `window.appBridge` calls with error handling
- Activities are classes instantiated by `ActivityManager` when selected
- `VoiceToAnimationBridge` intercepts speak calls to sync character lip-sync

## Building

```bash
# Package (unpacked)
npm run package

# Create installer
npm run make
```

Output goes to `out/`.

## Adding New Activities

1. Create `src/toddler_typing/web/js/activities/my_activity.js`
2. Add a `MyActivity` class with `start()` and `stop()` methods
3. Add the activity name to `VALID_ACTIVITIES` in `ipc-handlers.js`
4. Add HTML content method in `ActivityManager` (`app.js`)
5. Add the `<script>` tag in `index.html`
6. Add a menu card button in `index.html`

## Code Style

- Vanilla JavaScript (no build step, no transpiler)
- Bootstrap 5.3 for UI components
- CSS custom properties for theming
- No TypeScript (keep it simple for contributors)
