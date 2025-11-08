# Toddler Typing

A child-friendly program designed for safe computer interaction with educational content, keyboard locking, and engaging activities for young children (ages 2-5).

## Features

- **Keyboard Lock**: Prevents unwanted key combinations (Windows key, Alt+Tab, Alt+F4, etc.) while allowing safe exit via Ctrl+Shift+Esc
- **Interactive Learning Activities**:
  - Letters learning with keyboard input
  - Numbers recognition
  - Colors and shapes exploration
  - Simple drawing canvas
- **Child-Friendly UI**: Large, colorful buttons and engaging visual design
- **Portable**: Can be packaged as a standalone executable for Windows
- **Parental Controls**: Customizable settings via configuration file

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Windows OS (for keyboard locking functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd toddler-typing
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Application

```bash
python -m toddler_typing.main
```

Or install and run:
```bash
pip install -e .
toddler-typing
```

## Creating a Portable Executable

To create a standalone executable that can run on any Windows computer without Python:

1. Install build dependencies:
```bash
pip install -r requirements-build.txt
```

2. Run the build script:
```bash
python build.py
```

3. Find the executable in the `dist/` folder

4. Copy the entire `dist/toddler-typing/` folder to any Windows computer and run `toddler-typing.exe`

## Configuration

The application can be customized via a `config.json` file in the same directory as the executable. See `docs/configuration.md` for details.

Example configuration:
```json
{
  "fullscreen": true,
  "enable_keyboard_lock": true,
  "exit_combination": ["ctrl", "shift", "esc"],
  "enable_letters": true,
  "enable_numbers": true,
  "enable_colors": true,
  "enable_shapes": true
}
```

## Safety Features

- **Secure Exit**: Only Ctrl+Shift+Esc exits the program (difficult for toddlers to press accidentally)
- **Keyboard Protection**: Blocks Windows key, Alt+Tab, and other system key combinations
- **Fullscreen Mode**: Prevents accidental window switching
- **No Network Access**: Completely offline application

## Project Structure

```
toddler-typing/
├── src/
│   └── toddler_typing/
│       ├── __init__.py
│       ├── main.py                 # Main entry point
│       ├── config/                 # Configuration management
│       ├── keyboard/               # Keyboard locking functionality
│       ├── ui/                     # User interface components
│       ├── educational/            # Learning activities
│       ├── drawing/                # Drawing canvas
│       └── assets/                 # Images, sounds, fonts
├── tests/                          # Unit tests
├── docs/                           # Documentation
├── pyproject.toml                  # Project configuration
├── requirements.txt                # Dependencies
└── build.py                        # Build script for executable
```

## Development

### Setting Up Development Environment

1. Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

2. Run tests:
```bash
pytest
```

3. Format code:
```bash
black src/ tests/
```

4. Type checking:
```bash
mypy src/
```

### Adding New Activities

1. Create a new module in `src/toddler_typing/educational/`
2. Implement the activity class with `handle_event()`, `update()`, and `draw()` methods
3. Add the activity to the main menu in `ui/main_menu.py`

## AI Agent Integration

This project is structured to be AI-agent-friendly:

- Clear module organization with single responsibilities
- Type hints throughout the codebase
- Comprehensive docstrings
- Modular architecture for easy extension
- Well-defined interfaces between components

AI agents can easily:
- Navigate the codebase structure
- Understand component relationships
- Add new features or activities
- Modify existing functionality
- Generate tests

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## Acknowledgments

Built with:
- [Pygame](https://www.pygame.org/) - Game development library
- [Pynput](https://pynput.readthedocs.io/) - Keyboard control
- [PyInstaller](https://www.pyinstaller.org/) - Executable packaging

## Support

For issues or questions, please open an issue on the GitHub repository.
