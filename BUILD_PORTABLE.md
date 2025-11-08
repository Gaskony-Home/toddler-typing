# Building a Portable Distribution

This guide explains how to create a fully portable, self-contained version of Toddler Typing that can run on any Windows computer without Python or dependencies.

## What You'll Get

A complete folder containing:
- `toddler-typing.exe` - Standalone executable
- `START_TODDLER_TYPING.bat` - Double-click launcher
- Configuration files (dev, production, example)
- Complete documentation
- All required libraries bundled

**No Python installation needed on target computers!**

## Prerequisites

You only need these **once** to build the portable version:

1. **Python 3.8 or higher** (on your build machine)
2. **Build dependencies**:
   ```bash
   pip install -r requirements-build.txt
   ```

This installs PyInstaller and all required packages.

## Building the Portable Version

### Step 1: Run the Build Script

```bash
python build.py
```

This will:
1. ✅ Check all dependencies are installed
2. ✅ Clean previous build artifacts
3. ✅ Create standalone executable with PyInstaller
4. ✅ Bundle all required libraries
5. ✅ Copy documentation and config files
6. ✅ Create launcher batch file
7. ✅ Package everything into `dist/toddler-typing/`

### Step 2: Test the Build

```bash
cd dist/toddler-typing
./toddler-typing.exe
```

Or double-click `START_TODDLER_TYPING.bat`

### Step 3: Create Distribution Package

**Option A: Zip the folder**
```bash
# On Windows
cd dist
# Right-click 'toddler-typing' folder → Send to → Compressed (zipped) folder

# On Linux/Mac
cd dist
zip -r toddler-typing-portable.zip toddler-typing/
```

**Option B: Use the provided script** (coming soon)

## What Gets Included

The `dist/toddler-typing/` folder contains:

```
toddler-typing/
├── toddler-typing.exe           # Main executable (15-30 MB)
├── START_TODDLER_TYPING.bat     # Easy launcher
├── config.json                  # Default settings (dev mode)
├── config.dev.json              # Development configuration
├── config.production.json       # Production configuration
├── config.example.json          # Configuration template
├── PORTABLE_README.txt          # Instructions for users
├── QUICK_START.txt              # Quick start guide
├── USAGE.md                     # Detailed usage guide
├── README.md                    # Project information
└── _internal/                   # Bundled libraries (DO NOT DELETE)
    ├── pygame/
    ├── pynput/
    ├── python*.dll
    └── ... (other dependencies)
```

## Distribution

### For Users Who Download Your Zip

1. **Extract** the zip file anywhere on their computer
2. **Double-click** `toddler-typing.exe` or `START_TODDLER_TYPING.bat`
3. **That's it!** No installation needed

### Sharing Instructions

Include these instructions with your distribution:

```
TODDLER TYPING - INSTALLATION INSTRUCTIONS
==========================================

1. Extract the ZIP file to any location on your computer
   (Desktop, Documents, anywhere you like)

2. Open the extracted folder

3. Double-click one of these to start:
   • toddler-typing.exe
   • START_TODDLER_TYPING.bat (recommended)

4. To exit: Press ESC (default) or Ctrl+Shift+Esc

5. See QUICK_START.txt for more details

That's all! No installation required.
```

## Build Options

### Custom Build Settings

You can modify `build.py` to customize:

**Change executable name:**
```python
cmd = [
    "pyinstaller",
    "--name=my-custom-name",  # Change this
    # ... rest of options
]
```

**Add an icon:**
1. Place your icon at `src/toddler_typing/assets/images/icon.ico`
2. Build script will automatically include it

**Single file vs directory:**
```python
# Current (directory bundle)
"--onedir",

# Alternative (single file - slower startup)
"--onefile",
```

### Building on Different Systems

**Windows (Recommended):**
- Builds Windows executable (.exe)
- Keyboard locking works
- Best compatibility

**Linux:**
- Builds Linux binary
- Keyboard locking won't work
- For development/testing only

**macOS:**
- Builds macOS app
- Keyboard locking won't work
- For development/testing only

## Troubleshooting Build Issues

### PyInstaller Not Found
```bash
pip install --upgrade pyinstaller
```

### Missing Modules
```bash
pip install --upgrade -r requirements-build.txt
```

### Build Fails
1. Delete `build/` and `dist/` folders
2. Delete `*.spec` files
3. Run `python build.py` again

### Executable Too Large
This is normal! The executable includes:
- Python runtime (~10 MB)
- Pygame library (~10 MB)
- Other dependencies (~5-10 MB)
- Total: 25-35 MB (acceptable for modern systems)

### Antivirus False Positive
Some antivirus software flags PyInstaller executables:
- This is a known false positive
- The code is open source and safe
- You can add an exception in your antivirus
- Or sign the executable (advanced)

## Advanced: Code Signing (Optional)

To prevent antivirus false positives and show your name:

1. Get a code signing certificate
2. Sign the executable:
   ```bash
   signtool sign /f certificate.pfx /p password /t http://timestamp.server toddler-typing.exe
   ```

This is optional but recommended for public distribution.

## Automated Build Script (Future Enhancement)

Coming soon: `make-portable.sh` / `make-portable.bat` that:
- Builds the executable
- Creates the zip file
- Generates SHA256 checksum
- Creates release notes

## Testing the Portable Version

Before distributing:

1. ✅ Test on the build machine
2. ✅ Test on a clean Windows VM (no Python)
3. ✅ Test all configuration modes
4. ✅ Test all activities work
5. ✅ Verify exit combinations work
6. ✅ Check file size is reasonable
7. ✅ Scan with antivirus

## Size Optimization

Current size: ~25-35 MB

To reduce:
1. Use `--onefile` instead of `--onedir` (slower startup)
2. Use UPX compression:
   ```bash
   pip install pyinstaller[encryption]
   # Add to build.py: "--upx-dir=/path/to/upx"
   ```
3. Exclude unused modules (advanced)

## Continuous Distribution

For ongoing updates:

1. Update version in `src/toddler_typing/__init__.py`
2. Run `python build.py`
3. Test the build
4. Create release zip
5. Tag in git: `git tag v0.1.0`
6. Upload to releases

## Questions?

- Build issues? Check `build/` folder for logs
- Runtime issues? Test with Python version first
- See main [README.md](README.md) for more info

---

**You only need Python to BUILD the portable version.**

**Users who DOWNLOAD the zip need nothing - just extract and run!**
