# Toddler Typing Usage Guide

## Important Security Notice

Before using Toddler Typing with your child, please note:

- **Development Status**: This application is currently in development. Review [SECURITY.md](SECURITY.md) for current security status.
- **Keyboard Lock Limitations**: Ctrl+Alt+Delete cannot be blocked on Windows (by design). Parental supervision is recommended.
- **Test First**: Always test in development mode first before enabling keyboard lock and fullscreen.
- **Know the Exit**: Make sure you can exit the application (Ctrl+Shift+Esc) before enabling production mode.

## Quick Start

### Running the Application

The easiest way to run Toddler Typing:

```bash
python3 run.py
```

Or if you prefer to run as a module:

```bash
python3 -m toddler_typing.main
```

### First Time Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Choose Configuration** (optional):
   - For development/testing: `cp config.dev.json config.json`
   - For production use: `cp config.production.json config.json`
   - Or create your own from `config.example.json`

3. **Run the application**:
   ```bash
   python3 run.py
   ```

## Configuration

### Development Mode (Testing)
For testing on your computer with easy exit:

```bash
cp config.dev.json config.json
```

Features:
- Windowed mode (not fullscreen)
- Keyboard lock disabled
- Easy to exit with ESC key

### Production Mode (For Toddler Use)
For actual use with your toddler:

```bash
cp config.production.json config.json
```

Features:
- Fullscreen mode
- Keyboard lock enabled
- Only exits with Ctrl+Shift+Esc

### Custom Configuration

Edit `config.json` to customize:

```json
{
  "fullscreen": true,           // true = fullscreen, false = window
  "screen_width": 1024,         // Window width (if not fullscreen)
  "screen_height": 768,         // Window height (if not fullscreen)
  "enable_keyboard_lock": true, // Blocks system keys (Windows only)
  "exit_combination": ["ctrl", "shift", "esc"], // Keys to exit
  "default_brush_size": 20      // Starting brush size for drawing
}
```

## Activities

### Letters Activity
- Shows a random letter on screen
- Child presses the matching key on the keyboard
- Background flashes green on success!
- Helps learn letter recognition and keyboard location

### Numbers Activity
- Displays numbers 0-9
- Child presses the matching number key
- Visual feedback on correct answers
- Teaches number recognition

### Colors & Shapes Activity
- Shows colored geometric shapes
- Names the color and shape
- Click anywhere to see a new shape
- Learn colors (red, blue, green, yellow) and shapes (circle, square, triangle)

### Drawing Activity
- Simple crayon-like drawing tool
- Click colors on the left to change color
- Click numbers on the left to change brush size
- Draw with mouse by clicking and dragging
- "Clear" button to start over
- "Back" button to return to menu

## Controls

### For Development (when keyboard lock is disabled):
- **ESC**: Go back to menu (or exit if on menu)
- **Click buttons**: Navigate activities

### For Production (when keyboard lock is enabled):
- **Ctrl + Shift + Esc**: Exit the application (hard to press accidentally)
- **Click Back button**: Return to main menu
- **Click activity buttons**: Start activities

## Safety Features

### Keyboard Protection (Windows Only)
When enabled, blocks:
- Windows key
- Alt+Tab (window switching)
- Alt+F4 (close window)
- Other system shortcuts

### Fullscreen Mode
Prevents toddler from:
- Clicking outside the application
- Accessing other programs
- Accidentally closing the window

### Secure Exit
- Only Ctrl+Shift+Esc exits the program
- This combination is very difficult for a toddler to press accidentally
- Parents can easily remember it

## Troubleshooting

### Keyboard Lock Not Working
- **Platform**: Only works on Windows (gracefully disabled on other platforms)
- **Configuration**: Make sure `enable_keyboard_lock` is `true` in config.json
- **Permissions**: Try running as Administrator if issues persist
- **Testing**: For testing, set `enable_keyboard_lock` to `false`
- **Important**: Ctrl+Alt+Delete CANNOT be blocked on Windows - this is a security feature by design
- Some system key combinations may not be blockable due to Windows security policies

### Screen Size Issues
- Edit `config.json` to set custom `screen_width` and `screen_height`
- Set `fullscreen` to `false` for windowed mode
- Recommended: 1024x768 or 1920x1080

### Can't Exit the Program
- Press Ctrl + Shift + Esc together
- If keyboard lock is enabled and not working, Alt+F4 might work
- As last resort, restart the computer

### Application Won't Start
- Make sure Python 3.8+ is installed: `python3 --version`
- Install dependencies: `pip install -r requirements.txt`
- Check for error messages in the terminal
- Try with `enable_keyboard_lock: false` in config.json

## Tips for Parents

### First Time Use
1. Test in development mode first (keyboard lock disabled)
2. Learn the exit combination: Ctrl + Shift + Esc
3. Make sure you can exit before enabling fullscreen
4. Then switch to production mode for toddler use

### Best Practices
- Supervise young children during initial use
- Start with Colors & Shapes (simplest activity)
- Move to Letters and Numbers as they get comfortable
- Drawing is great for free play
- Take breaks every 10-15 minutes
- Adjust brush size if toddler has difficulty with drawing

### Customizing for Your Child
- Edit `config.json` to adjust settings
- Set `default_brush_size` larger for easier drawing
- Disable activities not age-appropriate
- Adjust screen size for your display

## Building Portable Executable

For running on any computer without Python:

```bash
pip install -r requirements-build.txt
python build.py
```

The executable will be in `dist/toddler-typing/`

See [Building Documentation](docs/development.md) for details.

## Safety and Security

### Parental Guidelines

1. **Always Supervise**: Especially during first-time use
2. **Test Exit Combination**: Ensure you can exit before enabling fullscreen
3. **Start Simple**: Begin with Colors & Shapes, progress to Letters/Numbers
4. **Take Breaks**: Limit screen time to 10-15 minute sessions
5. **Review Settings**: Understand configuration before using production mode

### Security Features

- **No Internet**: Application never connects online
- **No Data Collection**: Zero telemetry or tracking
- **Keyboard Lock**: Blocks system keys (Windows only, with limitations)
- **Fullscreen Mode**: Prevents window switching when enabled
- **Secure Exit**: Requires specific key combination

### Security Limitations

Be aware of these limitations:

1. **Ctrl+Alt+Delete**: Cannot be blocked (Windows security feature)
2. **Not a Security Boundary**: Keyboard lock is a convenience feature, not a security control
3. **Supervision Recommended**: Don't rely solely on keyboard lock
4. **Windows Only**: Keyboard lock only works on Windows

For detailed security information, see [SECURITY.md](SECURITY.md).

## Privacy

Toddler Typing respects your family's privacy:

- **No Data Collection**: We don't collect any information
- **No Analytics**: No tracking or telemetry
- **No Internet**: Completely offline
- **No Accounts**: No sign-up or registration
- **No Ads**: No advertisements or third-party content
- **Open Source**: All code is transparent and auditable

## Getting Help

- Check [README.md](README.md) for project overview
- See [docs/configuration.md](docs/configuration.md) for detailed config options
- See [docs/development.md](docs/development.md) for development guide
- Review [SECURITY.md](SECURITY.md) for security information
- Open an issue on GitHub for bugs or feature requests

## Additional Resources

- [Configuration Guide](docs/configuration.md) - Detailed configuration options
- [Development Guide](docs/development.md) - For developers and contributors
- [Build Guide](BUILD_PORTABLE.md) - Creating portable executables
- [Security Policy](SECURITY.md) - Security considerations and reporting
