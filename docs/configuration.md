# Configuration Guide

Settings are managed via `electron-conf` and persist automatically between sessions.

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `theme` | string | `"dark"` | UI theme: `"light"` or `"dark"` |
| `fullscreen` | boolean | `false` | Start in fullscreen mode |
| `voice_enabled` | boolean | `true` | Enable text-to-speech |
| `dino_voice_enabled` | boolean | `true` | Enable dinosaur voice |
| `keyboard_lock_enabled` | boolean | `false` | Block system keys (Windows only) |
| `volume` | number | `1.0` | Voice volume (0.0 - 1.0) |

## Storage Location

Settings are stored by `electron-conf` in the OS-specific app data directory:

| Platform | Path |
|----------|------|
| Windows | `%APPDATA%/toddler-typing/` |
| macOS | `~/Library/Application Support/toddler-typing/` |
| Linux | `~/.config/toddler-typing/` |

Two files are created:
- `settings.json` - User preferences
- `progress.json` - Stars, levels, and activity progress

## Progress Tracking

Progress is stored separately and tracks:
- Total stars earned
- Current level (1-4)
- Stars earned per activity
- Level thresholds: Level 2 at 51 stars, Level 3 at 151, Level 4 at 301

## Modifying Settings

Settings can be changed through the app UI:
- **Theme**: Click the moon/sun icon in the header
- **Mute**: Click the speaker icon in the header
- **Fullscreen**: Click the fullscreen icon in the header

To reset all settings, delete the configuration files from the storage location above.
