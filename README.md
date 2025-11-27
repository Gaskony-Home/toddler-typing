# Toddler Typing

A child-friendly educational app for toddlers (ages 2-5) with engaging activities, keyboard protection, and cross-platform support.

## Features

- **Educational Activities**:
  - Letters & Numbers learning with keyboard/touch input
  - Colors & Shapes exploration
  - Drawing canvas with multiple colors and brush sizes
  - Coloring pages
  - Dot-to-dot games
  - Animal sounds

- **Interactive Dinosaur Character**: Animated companion that reacts to activities and speaks encouragement

- **Safety Features**:
  - Keyboard lock (Windows) - blocks system keys like Alt+Tab, Windows key
  - Fullscreen mode prevents accidental window switching
  - Secure exit: Ctrl+Shift+Esc (parent-only combination)
  - Completely offline - no internet, no data collection

- **Cross-Platform**: Windows desktop app + Android tablet app

## Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| Windows | Ready | Full keyboard lock support |
| Android | Ready | Optimized for 10" tablets |
| macOS/Linux | Partial | No keyboard lock |

## Quick Start

### Windows (Desktop)

**Option 1: Run from Source**
```bash
pip install -r requirements.txt
python run.py
```

**Option 2: Build Portable Executable**
```bash
pip install -r requirements-build.txt
python make-portable.py
```
Creates a standalone ZIP in `releases/` - no Python needed on target machine.

### Android (Tablet)

1. Open the `android/` folder in Android Studio
2. Connect your tablet via USB (enable Developer Mode)
3. Click Run

See [android/README.md](android/README.md) for detailed instructions.

## Configuration

Edit `config.json` to customize:

```json
{
  "fullscreen": true,
  "enable_keyboard_lock": true,
  "exit_combination": ["ctrl", "shift", "esc"],
  "enable_letters": true,
  "enable_numbers": true,
  "default_brush_size": 20
}
```

**Modes:**
- `config.dev.json` - Development (windowed, ESC to exit)
- `config.production.json` - Production (fullscreen, keyboard lock)

See [docs/configuration.md](docs/configuration.md) for all options.

## Project Structure

```
toddler-typing/
├── src/toddler_typing/     # Python source code
│   ├── ui/                 # User interface components
│   ├── educational/        # Learning activities
│   ├── drawing/            # Drawing canvas
│   ├── keyboard/           # Keyboard locking (Windows)
│   └── assets/             # Images, sounds, fonts
├── android/                # Android app (Kotlin + WebView)
│   ├── app/src/main/
│   │   ├── java/           # Kotlin source
│   │   └── assets/web/     # Web frontend
│   └── README.md           # Android build instructions
├── docs/                   # Documentation
│   ├── USAGE.md            # User guide
│   ├── DEVELOPMENT.md      # Developer guide
│   ├── BUILD_PORTABLE.md   # Build instructions
│   └── configuration.md    # Config options
├── tests/                  # Unit tests
└── releases/               # Built executables
```

## Documentation

- [Usage Guide](docs/USAGE.md) - How to use the app
- [Development Guide](docs/DEVELOPMENT.md) - For contributors
- [Build Guide](docs/BUILD_PORTABLE.md) - Creating portable executables
- [Configuration](docs/configuration.md) - All config options
- [Security Policy](SECURITY.md) - Security info and reporting
- [Roadmap](ROADMAP.md) - Future plans

## Development

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black src/ tests/

# Type checking
mypy src/
```

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
- [Pygame](https://www.pygame.org/) - Python game library
- [Pynput](https://pynput.readthedocs.io/) - Keyboard control
- [PyInstaller](https://www.pyinstaller.org/) - Executable packaging
- Android WebView + Kotlin
