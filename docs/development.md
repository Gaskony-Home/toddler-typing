# Development Guide

This guide helps developers understand and extend the Toddler Typing application.

## Architecture Overview

The application follows a modular architecture:

```
┌─────────────────┐
│   main.py       │  - Application entry point
│  (ToddlerTypingApp)│  - Main game loop
└────────┬────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
┌───▼────────┐              ┌────────▼─────┐
│   UI       │              │  Keyboard    │
│ Components │              │   Locker     │
└───┬────────┘              └──────────────┘
    │
    ├─── MainMenu
    ├─── Button
    │
    ├─── Educational Modules
    │    ├─── Letters
    │    ├─── Numbers
    │    └─── ColorsShapes
    │
    └─── Drawing
         └─── Canvas

         Config (Settings)
```

## Core Components

### 1. Main Application (`main.py`)

The `ToddlerTypingApp` class manages:
- Pygame initialization
- Main game loop
- Event handling
- Screen updates
- Resource cleanup

Key methods:
- `initialize()`: Set up Pygame and components
- `run()`: Main game loop
- `cleanup()`: Clean up resources

### 2. Configuration (`config/settings.py`)

The `Settings` class manages all application configuration:
- Default values
- Loading from `config.json`
- Saving configuration
- Color schemes
- Feature flags

### 3. Keyboard Locker (`keyboard/locker.py`)

The `KeyboardLocker` class provides:
- Background keyboard monitoring
- Key combination blocking
- Exit sequence detection

**Windows Only**: Uses `pynput` library which requires Windows platform.

### 4. UI Components (`ui/`)

#### Button (`ui/button.py`)
Reusable button component with:
- Hover effects
- Click handling
- Customizable colors and sizes

#### Main Menu (`ui/main_menu.py`)
Main activity selection screen with:
- Title display
- Activity buttons
- Navigation to activities

### 5. Educational Modules (`educational/`)

Each activity module implements:
- `__init__(screen, settings)`: Initialize the activity
- `handle_event(event)`: Process user input
- `update()`: Update activity state
- `draw()`: Render the activity

#### Letters Activity
- Displays random letters
- Listens for keyboard input
- Provides feedback on correct key press

#### Numbers Activity
- Shows numbers 0-9
- Keyboard input matching
- Success feedback

#### Colors & Shapes Activity
- Displays colored shapes
- Names colors and shapes
- Click to cycle through

### 6. Drawing Module (`drawing/canvas.py`)

Simple drawing interface with:
- Color palette selection
- Brush size options
- Clear canvas button
- Mouse-based drawing

## Adding New Features

### Adding a New Activity

1. Create a new file in `src/toddler_typing/educational/`:

```python
# new_activity.py
import pygame
from ..config.settings import Settings

class NewActivity:
    def __init__(self, screen: pygame.Surface, settings: Settings) -> None:
        self.screen = screen
        self.settings = settings
        # Initialize your activity

    def handle_event(self, event: pygame.event.Event) -> None:
        # Handle user input
        pass

    def update(self) -> None:
        # Update activity state
        pass

    def draw(self) -> None:
        # Draw the activity
        self.screen.fill(self.settings.colors["background"])
        # Your drawing code here
```

2. Add to `educational/__init__.py`:

```python
from .new_activity import NewActivity

__all__ = [..., "NewActivity"]
```

3. Add button in `ui/main_menu.py`:

```python
button_configs = [
    # ... existing buttons
    ("New Activity", self.settings.colors["primary"], self._start_new_activity),
]

def _start_new_activity(self) -> None:
    from ..educational.new_activity import NewActivity
    # Implement activity start logic
```

### Adding Sound Effects

1. Place sound files in `src/toddler_typing/assets/sounds/`

2. Load in your activity:

```python
import pygame

class MyActivity:
    def __init__(self, screen, settings):
        self.success_sound = pygame.mixer.Sound(
            settings.sounds_dir / "success.wav"
        )

    def on_success(self):
        if self.settings.enable_sounds:
            self.success_sound.play()
```

### Adding Images

1. Place images in `src/toddler_typing/assets/images/`

2. Load in your activity:

```python
import pygame

class MyActivity:
    def __init__(self, screen, settings):
        self.background = pygame.image.load(
            settings.images_dir / "background.png"
        )
```

## Testing

### Running Tests

```bash
pytest
```

### Writing Tests

Create test files in `tests/` directory:

```python
# tests/test_my_feature.py
import pytest
from toddler_typing.my_module import MyClass

def test_my_feature():
    obj = MyClass()
    assert obj.method() == expected_value
```

### Test Coverage

```bash
pytest --cov=toddler_typing tests/
```

## Code Style

### Formatting

Use Black for code formatting:

```bash
black src/ tests/
```

### Type Checking

Use mypy for type checking:

```bash
mypy src/
```

### Docstrings

Follow Google-style docstrings:

```python
def function(arg1: str, arg2: int) -> bool:
    """
    Short description.

    Longer description if needed.

    Args:
        arg1: Description of arg1.
        arg2: Description of arg2.

    Returns:
        Description of return value.
    """
    pass
```

## Performance Considerations

### Frame Rate
- Target 60 FPS for smooth animations
- Use `clock.tick(60)` to maintain frame rate
- Profile with pygame's built-in tools

### Memory
- Preload images and sounds in `__init__`
- Don't create new surfaces every frame
- Clean up resources in activity cleanup

### Drawing Optimization
- Only redraw changed areas when possible
- Use dirty rect updating for complex scenes
- Cache rendered text surfaces

## Debugging

### Enable Debug Mode

Set environment variable:
```bash
export DEBUG=1
python -m toddler_typing.main
```

### Common Issues

1. **Keyboard lock not working**: Check Windows permissions
2. **Sound not playing**: Verify pygame.mixer is initialized
3. **Images not loading**: Check file paths relative to assets directory

## Building for Distribution

See `build.py` for creating standalone executables.

Key considerations:
- Include all asset files
- Bundle Python runtime
- Test on clean Windows system
- Create installer if desired

## Security Guidelines

### Secure Coding Practices

When contributing to Toddler Typing, follow these security guidelines:

#### Input Validation

**Always validate inputs:**
```python
def set_brush_size(self, size: int) -> None:
    """Set brush size with validation."""
    if not isinstance(size, int):
        raise TypeError("Brush size must be an integer")
    if size < 1 or size > 100:
        raise ValueError("Brush size must be between 1 and 100")
    self.brush_size = size
```

#### File Path Handling

**Always validate and sanitize file paths:**
```python
from pathlib import Path

def load_asset(self, filename: str) -> Path:
    """Load asset with path validation."""
    # Get base directory
    base_dir = Path(__file__).parent.resolve()

    # Construct path
    asset_path = (base_dir / "assets" / filename).resolve()

    # Validate it's within allowed directory
    try:
        asset_path.relative_to(base_dir / "assets")
    except ValueError:
        raise SecurityError(f"Invalid asset path: {filename}")

    if not asset_path.exists():
        raise FileNotFoundError(f"Asset not found: {filename}")

    return asset_path
```

#### Error Handling

**Never expose sensitive information in error messages:**
```python
# Bad - exposes file paths
try:
    with open(config_file) as f:
        config = json.load(f)
except Exception as e:
    print(f"Error: {e}")  # Don't do this

# Good - generic error message to user, detailed logging for developers
import logging
logger = logging.getLogger(__name__)

try:
    with open(config_file) as f:
        config = json.load(f)
except json.JSONDecodeError:
    logger.error(f"Invalid JSON in {config_file}")
    print("Configuration file is invalid. Using defaults.")
except Exception as e:
    logger.exception("Unexpected error loading config")
    print("Error loading configuration. Using defaults.")
```

#### Command Execution

**Never use shell=True, always validate inputs:**
```python
# Bad - command injection risk
subprocess.run(f"pyinstaller {user_input}", shell=True)

# Good - list arguments, no shell
subprocess.run(["pyinstaller", validated_argument], check=True)
```

### Security Testing

Before submitting a pull request:

1. **Test with Invalid Inputs**:
   - Malformed JSON in config files
   - Invalid paths (path traversal attempts)
   - Out-of-range values
   - Wrong data types

2. **Review Error Messages**:
   - Ensure no file paths exposed
   - No stack traces visible to end users
   - Generic error messages for security-sensitive operations

3. **Check Dependencies**:
   - Only use dependencies from official PyPI
   - Verify package integrity
   - Keep dependencies updated

### Security Checklist for Pull Requests

Before submitting, verify:

- [ ] All user inputs are validated
- [ ] File paths are sanitized and validated
- [ ] No hardcoded credentials or sensitive data
- [ ] Error messages don't leak information
- [ ] No use of `eval()`, `exec()`, `shell=True`
- [ ] Dependencies are from trusted sources
- [ ] Tests cover security edge cases
- [ ] Documentation updated if security-related

See [../SECURITY.md](../SECURITY.md) for more detailed security information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (including security tests)
5. Run code formatting and type checking
6. Review security checklist above
7. Submit a pull request

### Pull Request Guidelines

- Include clear description of changes
- Reference any related issues
- Include tests for new features
- Update documentation as needed
- Follow coding style guidelines
- Pass all CI checks

## Resources

### Documentation
- [Pygame Documentation](https://www.pygame.org/docs/)
- [Pynput Documentation](https://pynput.readthedocs.io/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Python Security](https://python.readthedocs.io/en/stable/library/security_warnings.html)
- [CWE Top 25](https://cwe.mitre.org/top25/)
