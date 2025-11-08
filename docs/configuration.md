# Configuration Guide

This guide explains how to customize the Toddler Typing application through configuration.

## Security Warning

Configuration files control important security features like keyboard locking and exit combinations. Always:
- Use configuration files from trusted sources only
- Validate JSON syntax before use
- Review security settings before enabling for toddler use
- See [../SECURITY.md](../SECURITY.md) for security best practices

## Configuration File

The application looks for a `config.json` file in the same directory as the executable (or in the project root when running from source).

### Creating a Configuration File

Create a file named `config.json` with your desired settings. The application will use default values for any settings not specified.

## Available Settings

### Display Settings

```json
{
  "screen_width": 1024,
  "screen_height": 768,
  "fullscreen": true,
  "fps": 60
}
```

- `screen_width`: Window width in pixels (default: 1024)
- `screen_height`: Window height in pixels (default: 768)
- `fullscreen`: Start in fullscreen mode (default: true, recommended for children)
- `fps`: Frames per second (default: 60)

### Keyboard Lock Settings

```json
{
  "enable_keyboard_lock": true,
  "exit_combination": ["ctrl", "shift", "esc"],
  "blocked_keys": ["windows", "cmd", "alt+tab", "alt+f4", "ctrl+alt+delete"]
}
```

- `enable_keyboard_lock`: Enable keyboard locking (default: true, Windows only)
- `exit_combination`: Keys required to exit the program (default: ["ctrl", "shift", "esc"])
- `blocked_keys`: System keys to block (default includes Windows key, Alt+Tab, etc.)

**Security Notes**:
- The exit combination should be difficult for a toddler to press accidentally but easy for parents to remember.
- **Important**: Ctrl+Alt+Delete cannot be blocked on Windows. This is a security feature by design.
- Keyboard lock only works on Windows. On other platforms, this setting is ignored.
- The keyboard lock is not a security boundary - parental supervision is still recommended.
- Test the exit combination before enabling fullscreen mode to ensure you can exit the application.

### Educational Content Settings

```json
{
  "enable_letters": true,
  "enable_numbers": true,
  "enable_colors": true,
  "enable_shapes": true,
  "enable_sounds": true
}
```

- `enable_letters`: Show letters activity in menu (default: true)
- `enable_numbers`: Show numbers activity in menu (default: true)
- `enable_colors`: Show colors in activities (default: true)
- `enable_shapes`: Show shapes in activities (default: true)
- `enable_sounds`: Enable sound effects (default: true)

### Drawing Settings

```json
{
  "default_brush_size": 20
}
```

- `default_brush_size`: Starting brush size for drawing (default: 20)

## Example Configurations

### For Younger Children (2-3 years)

Focus on colors and shapes, larger UI elements:

```json
{
  "screen_width": 1280,
  "screen_height": 720,
  "fullscreen": true,
  "enable_letters": false,
  "enable_numbers": false,
  "enable_colors": true,
  "enable_shapes": true,
  "default_brush_size": 30
}
```

### For Older Children (4-5 years)

Enable all learning activities:

```json
{
  "fullscreen": true,
  "enable_letters": true,
  "enable_numbers": true,
  "enable_colors": true,
  "enable_shapes": true,
  "enable_sounds": true,
  "default_brush_size": 20
}
```

### Testing/Development Mode

Disable keyboard lock for easier development:

```json
{
  "fullscreen": false,
  "enable_keyboard_lock": false,
  "screen_width": 1024,
  "screen_height": 768
}
```

## Applying Configuration Changes

1. Edit the `config.json` file
2. Save the file
3. Restart the application

The application will automatically load the new settings on startup.

## Troubleshooting

### Configuration Not Loading

- Ensure `config.json` is in the same directory as the executable
- Check that the JSON syntax is valid (use a JSON validator)
- Check console output for error messages

### Invalid Settings

If a setting has an invalid value, the application will:
1. Print a warning to the console
2. Use the default value for that setting
3. Continue running normally

### Reset to Defaults

To reset to default settings:
1. Delete or rename `config.json`
2. Restart the application
3. Default settings will be used

## Security Best Practices

### Configuration File Security

1. **Validate Sources**: Only use configuration files from trusted sources
2. **JSON Validation**: Ensure your config file has valid JSON syntax
3. **Backup Original**: Keep a backup of working configuration files
4. **Limit Permissions**: On multi-user systems, ensure config files are not world-writable

### Recommended Settings for Toddler Use

```json
{
  "fullscreen": true,
  "enable_keyboard_lock": true,
  "exit_combination": ["ctrl", "shift", "esc"],
  "enable_letters": true,
  "enable_numbers": true,
  "enable_colors": true,
  "enable_shapes": true,
  "enable_sounds": true
}
```

### Recommended Settings for Development/Testing

```json
{
  "fullscreen": false,
  "enable_keyboard_lock": false,
  "screen_width": 1024,
  "screen_height": 768
}
```

### Configuration Validation

The application validates configuration values and will:
- Use default values for invalid or missing settings
- Print warnings for unrecognized configuration keys
- Continue running even if the config file has errors

However, you should still:
- Test configuration changes before using with children
- Verify the exit combination works before enabling keyboard lock
- Keep a backup of working configurations

For more security information, see [../SECURITY.md](../SECURITY.md).
