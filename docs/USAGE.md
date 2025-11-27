# Usage Guide

## Quick Start

```bash
pip install -r requirements.txt
python run.py
```

## Configuration Modes

### Development Mode
For testing with easy exit:
```bash
copy config.dev.json config.json
```
- Windowed mode
- ESC key to exit

### Production Mode
For toddler use:
```bash
copy config.production.json config.json
```
- Fullscreen mode
- Keyboard lock enabled (Windows)
- Exit: Ctrl+Shift+Esc

## Activities

### Letters & Numbers
- Shows a letter or number on screen
- Child presses the matching key
- Visual and audio feedback on success

### Colors & Shapes
- Shows colored geometric shapes
- Click anywhere to see a new shape
- Names color and shape (with TTS)

### Drawing
- Drawing canvas with multiple colors
- Click colors to change color
- Click numbers to change brush size
- Clear button to start over

### Coloring Pages
- Pre-made pictures to color
- Tap areas to fill with color
- Multiple images available

### Dot-to-Dot
- Connect numbered dots
- Reveals picture when complete

### Animal Sounds
- Click animals to hear their sounds

## Controls

| Mode | Exit | Navigate |
|------|------|----------|
| Development | ESC | Click buttons |
| Production | Ctrl+Shift+Esc | Click buttons |

## Safety Features

### Keyboard Lock (Windows Only)
Blocks:
- Windows key
- Alt+Tab
- Alt+F4
- Other system shortcuts

**Note:** Ctrl+Alt+Delete cannot be blocked (Windows security feature)

### Fullscreen Mode
Prevents:
- Clicking outside the app
- Accessing other programs
- Accidental window closing

## Tips for Parents

1. **Test first** - Use dev mode before production mode
2. **Learn the exit** - Ctrl+Shift+Esc
3. **Start simple** - Colors & Shapes first
4. **Take breaks** - 10-15 minute sessions
5. **Supervise** - Especially during first use

## Troubleshooting

### Can't Exit
- Press Ctrl+Shift+Esc together
- If that fails, try Alt+F4
- Last resort: restart computer

### Keyboard Lock Not Working
- Windows only
- Try running as Administrator
- Check `enable_keyboard_lock: true` in config.json

### Screen Size Issues
Edit config.json:
```json
{
  "fullscreen": false,
  "screen_width": 1024,
  "screen_height": 768
}
```

### Won't Start
- Check Python 3.8+ installed
- Run `pip install -r requirements.txt`
- Try with `enable_keyboard_lock: false`

## Privacy

- No internet connection
- No data collection
- No ads
- Completely offline
