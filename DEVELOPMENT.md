# Development Guide for Toddler Typing

## Version Control System

The application now has an automatic version control system. The version number is displayed in the **bottom left** corner of the main menu.

### Current Version System

- Version file: `src/toddler_typing/__version__.py`
- Format: `MAJOR.MINOR.PATCH` (e.g., `1.0.2`)
- Displayed on main menu in bottom left corner

### How to Update Version

There are three ways to increment the version:

#### 1. Manual Version Increment (Recommended)

```bash
# Increment patch version (1.0.0 -> 1.0.1)
python increment_version.py patch

# Increment minor version (1.0.0 -> 1.1.0)
python increment_version.py minor

# Increment major version (1.0.0 -> 2.0.0)
python increment_version.py major
```

#### 2. Quick Build with Auto-Increment

Use the `quick_build.bat` script to automatically:
1. Increment the patch version
2. Build the executable
3. Update the desktop shortcut

```bash
# Just double-click or run:
quick_build.bat
```

#### 3. Manual Edit

Edit `src/toddler_typing/__version__.py` directly:
```python
"""Version information for Toddler Typing."""

__version__ = "1.0.0"
```

## Building the Application

### Standard Build Process

```bash
python build.py
```

This will:
1. Clean previous builds
2. Create executable in `dist/toddler-typing/`
3. Copy configuration files
4. Create documentation
5. **Automatically update desktop shortcut** to point to new build

### Desktop Shortcut Management

The build process **automatically updates** your desktop shortcut to always point to the latest build location:

- Shortcut location: `Desktop/Toddler Typing.lnk`
- Points to: `<project>/dist/toddler-typing/toddler-typing.exe`
- Updated every time you run `build.py`

**Important:** The shortcut is created/updated by `create_shortcut.ps1` which runs automatically during build.

### Ensuring You Always Run Latest Version

To make sure the shortcut always opens the latest build:

1. **After making code changes**, always rebuild:
   ```bash
   python build.py
   ```
   OR use the quick build script:
   ```bash
   quick_build.bat
   ```

2. The desktop shortcut will be **automatically updated** to the new build

3. Close any running instances before building (or they may interfere)

### Common Workflows

#### Workflow 1: Quick Feature Update
```bash
# 1. Make your code changes
# 2. Run quick build (increments version & builds)
quick_build.bat
# 3. Desktop shortcut now points to latest build with new version
```

#### Workflow 2: Manual Version Control
```bash
# 1. Make your code changes
# 2. Increment version manually
python increment_version.py minor   # or major/patch
# 3. Build
python build.py
# 4. Desktop shortcut updated automatically
```

#### Workflow 3: Testing Without Building
```bash
# Run directly from source (shows "dev" version)
python run.py
```

## Version Display

The version is shown in the **bottom left corner** of the main menu screen:
- Color: Uses `text_secondary` from theme (subtle gray)
- Font size: 24px
- Format: `v1.0.0`

## Troubleshooting

### Desktop Shortcut Not Updating

If the desktop shortcut doesn't update:
1. Check if `create_shortcut.ps1` exists
2. Run PowerShell script manually:
   ```powershell
   powershell -ExecutionPolicy Bypass -File create_shortcut.ps1
   ```
3. Verify build completed successfully (check `dist/toddler-typing/` folder)

### Version Not Showing in App

1. Check `src/toddler_typing/__version__.py` exists
2. Make sure you rebuilt after version change
3. Version shows as "dev" when running from source without building

### Build Fails

1. Make sure all dependencies are installed:
   ```bash
   pip install -r requirements-build.txt
   ```
2. Close all running instances of the app
3. Check for permission issues in `dist/` folder

## File Structure

```
toddler-typing/
├── src/toddler_typing/
│   ├── __version__.py          # Version file
│   └── ui/main_menu.py         # Displays version
├── VERSION                      # Reference version file
├── increment_version.py         # Version increment script
├── build.py                     # Main build script
├── quick_build.bat             # Quick build script
├── create_shortcut.ps1         # Desktop shortcut updater
└── dist/toddler-typing/        # Built executable location
    └── toddler-typing.exe      # The app (shortcut points here)
```

## Best Practices

1. **Always rebuild after code changes** before using the desktop shortcut
2. **Use version control** - commit version changes with your code
3. **Increment versions meaningfully**:
   - **Patch** (1.0.0 → 1.0.1): Bug fixes, minor tweaks
   - **Minor** (1.0.0 → 1.1.0): New features, enhancements
   - **Major** (1.0.0 → 2.0.0): Breaking changes, major overhauls
4. **Test before building** - run from source first with `python run.py`
5. **Use quick_build.bat** for convenience - it handles everything

## Summary

**To ensure the desktop shortcut always opens the latest version:**
1. Make your code changes
2. Run `quick_build.bat` or `python build.py`
3. The shortcut is automatically updated
4. Close old instances and use the desktop shortcut

The version number in the bottom left of the menu confirms you're running the correct version!
