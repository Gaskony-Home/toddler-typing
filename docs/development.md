# Development Guide

## Getting Started

### Prerequisites
- Python 3.8+
- pip

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install -r requirements-dev.txt

# Run from source
python run.py
```

## Project Structure

```
src/toddler_typing/
├── main.py              # Entry point
├── __version__.py       # Version number
├── config/              # Configuration management
│   └── settings.py
├── ui/                  # User interface
│   ├── main_menu.py
│   └── button.py
├── educational/         # Learning activities
│   ├── letters_numbers.py
│   ├── colors_shapes.py
│   └── coloring.py
├── drawing/             # Drawing canvas
│   └── canvas.py
├── keyboard/            # Keyboard lock (Windows)
│   └── locker.py
├── audio/               # Sound/TTS
│   └── voice_manager.py
└── assets/              # Images, sounds, fonts
```

## Version Management

Version is stored in `src/toddler_typing/__version__.py`:

```bash
# Increment version
python increment_version.py patch   # 1.0.0 -> 1.0.1
python increment_version.py minor   # 1.0.0 -> 1.1.0
python increment_version.py major   # 1.0.0 -> 2.0.0
```

## Building

### Run from Source
```bash
python run.py
```

### Build Executable
```bash
pip install -r requirements-build.txt
python build.py
```
Output: `dist/toddler-typing/toddler-typing.exe`

### Create Release Package
```bash
python make-portable.py
```
Output: `releases/toddler-typing-portable-*.zip`

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/toddler_typing

# Format code
black src/ tests/

# Type checking
mypy src/
```

## Adding New Activities

1. Create a new module in `src/toddler_typing/educational/`
2. Implement the activity class with:
   - `handle_event(event)` - Handle user input
   - `update()` - Update game state
   - `draw(screen)` - Render to screen
3. Add the activity to `ui/main_menu.py`

## Configuration

Two config modes:
- `config.dev.json` - Development (windowed, easy exit)
- `config.production.json` - Production (fullscreen, keyboard lock)

Copy desired config to `config.json`:
```bash
cp config.dev.json config.json
```

## Code Style

- Use type hints
- Follow PEP 8
- Run `black` before committing
- Keep functions small and focused
- Add docstrings to public methods

## Security Guidelines

- Validate all user inputs
- Never use `eval()` or `exec()`
- Use parameterized paths
- Review [SECURITY.md](../SECURITY.md) before adding features
