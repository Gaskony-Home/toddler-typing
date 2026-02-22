# Toddler Typing

A child-friendly educational app for toddlers (ages 2-5) with engaging activities, keyboard protection, and cross-platform support.

## Features

- **Educational Activities**:
  - Letters & Numbers learning with keyboard/touch input
  - Colors & Shapes exploration
  - Drawing canvas with multiple colors and brush sizes
  - Coloring pages
  - Dot-to-dot games
  - Letter sounds (phonics)

- **Interactive Dinosaur Character**: Animated companion that reacts to activities and speaks encouragement via text-to-speech

- **Progress System**: Star rewards and level progression

- **Safety Features**:
  - Keyboard lock (Windows) - blocks system keys like Alt+Tab, Windows key
  - Fullscreen mode prevents accidental window switching
  - Completely offline - no internet, no data collection

- **Cross-Platform**: Windows/macOS/Linux desktop (Electron) + Android tablet

## Quick Start

```bash
npm install
npm start
```

## Building

```bash
# Package the app
npm run package

# Create installer
npm run make
```

See [docs/BUILD.md](docs/BUILD.md) for details.

## Project Structure

```
toddler-typing/
├── electron/                  # Electron main process
│   ├── main.js               # App entry point
│   ├── preload.js            # Context bridge
│   ├── ipc-handlers.js       # IPC message handlers
│   └── modules/              # Backend modules
│       ├── progress-manager.js
│       ├── settings-manager.js
│       ├── keyboard-locker.js
│       └── auto-updater.js
├── src/toddler_typing/web/   # Frontend
│   ├── index.html            # Main page
│   ├── css/custom.css        # Styles
│   ├── js/
│   │   ├── app.js            # Main app logic
│   │   ├── api-bridge.js     # Backend API bridge
│   │   ├── dino-voice.js     # Text-to-speech
│   │   ├── character_manager.js    # 3D character (Three.js)
│   │   ├── character_manager_2d.js # 2D character fallback
│   │   └── activities/       # Activity modules
│   ├── assets/               # Images, SVGs, models
│   └── libs/                 # Bundled libraries
├── android/                  # Android app (Kotlin + WebView)
├── docs/                     # Documentation
├── forge.config.js           # Electron Forge config
└── package.json
```

## Documentation

- [Usage Guide](docs/USAGE.md) - How to use the app
- [Development Guide](docs/DEVELOPMENT.md) - For contributors
- [Build Guide](docs/BUILD.md) - Creating installers
- [Configuration](docs/configuration.md) - Settings reference
- [Security Policy](SECURITY.md) - Security info and reporting
- [Roadmap](ROADMAP.md) - Future plans

## Safety & Privacy

- **No Internet**: Completely offline
- **No Data Collection**: Zero telemetry
- **No Ads**: No advertisements
- **Open Source**: All code is auditable
- **COPPA/GDPR**: No personal data processed

## License

MIT License - See [LICENSE](LICENSE)

## Contributing

Contributions welcome! Please see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for guidelines.

## Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/) - Desktop framework
- [Bootstrap 5.3](https://getbootstrap.com/) - UI framework
- [Three.js](https://threejs.org/) - 3D rendering
- [Bootstrap Icons](https://icons.getbootstrap.com/) - Icon set
