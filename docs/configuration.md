# Configuration Guide

The app uses `config.json` in the project root directory.

## Quick Setup

**Development (testing):**
```bash
copy config.dev.json config.json
```

**Production (toddler use):**
```bash
copy config.production.json config.json
```

## All Settings

```json
{
  "screen_width": 1024,
  "screen_height": 768,
  "fullscreen": true,
  "fps": 60,
  "enable_keyboard_lock": true,
  "exit_combination": ["ctrl", "shift", "esc"],
  "enable_letters": true,
  "enable_numbers": true,
  "enable_colors": true,
  "enable_shapes": true,
  "enable_sounds": true,
  "default_brush_size": 20
}
```

## Settings Reference

### Display
| Setting | Default | Description |
|---------|---------|-------------|
| `screen_width` | 1024 | Window width (when not fullscreen) |
| `screen_height` | 768 | Window height (when not fullscreen) |
| `fullscreen` | true | Enable fullscreen mode |
| `fps` | 60 | Frames per second |

### Security
| Setting | Default | Description |
|---------|---------|-------------|
| `enable_keyboard_lock` | true | Block system keys (Windows only) |
| `exit_combination` | ["ctrl", "shift", "esc"] | Keys to exit |

### Activities
| Setting | Default | Description |
|---------|---------|-------------|
| `enable_letters` | true | Show letters activity |
| `enable_numbers` | true | Show numbers activity |
| `enable_colors` | true | Enable colors in activities |
| `enable_shapes` | true | Enable shapes in activities |
| `enable_sounds` | true | Enable sound effects |

### Drawing
| Setting | Default | Description |
|---------|---------|-------------|
| `default_brush_size` | 20 | Starting brush size |

## Example Configs

### For Younger Kids (2-3)
```json
{
  "fullscreen": true,
  "enable_letters": false,
  "enable_numbers": false,
  "default_brush_size": 30
}
```

### For Older Kids (4-5)
```json
{
  "fullscreen": true,
  "enable_letters": true,
  "enable_numbers": true,
  "default_brush_size": 20
}
```

### For Development
```json
{
  "fullscreen": false,
  "enable_keyboard_lock": false,
  "screen_width": 1024,
  "screen_height": 768
}
```

## Applying Changes

1. Edit `config.json`
2. Save the file
3. Restart the application

## Notes

- Invalid values use defaults (with warning)
- Missing settings use defaults
- Keyboard lock only works on Windows
- Test exit combination before using fullscreen
