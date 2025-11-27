# Building a Portable Distribution

Create a standalone Windows executable that runs without Python.

## Quick Build

```bash
pip install -r requirements-build.txt
python make-portable.py
```

Output: `releases/toddler-typing-portable-*.zip`

## What You Get

```
toddler-typing/
├── toddler-typing.exe       # Main executable (~6MB)
├── START_TODDLER_TYPING.bat # Easy launcher
├── config.json              # Settings
├── config.dev.json          # Dev settings
├── config.production.json   # Production settings
├── README.md                # Documentation
└── _internal/               # Bundled libraries (~55MB)
```

**Total size:** ~30MB compressed, ~60MB extracted

## Build Steps

### Step 1: Install Build Dependencies
```bash
pip install -r requirements-build.txt
```

### Step 2: Build Executable
```bash
python build.py
```
Creates `dist/toddler-typing/`

### Step 3: Create Release Package
```bash
python make-portable.py
```
Creates ZIP in `releases/` with SHA256 checksum.

## For End Users

1. Download the ZIP file
2. Extract to any folder
3. Double-click `toddler-typing.exe`

No installation needed!

## System Requirements

- Windows 7 or later
- ~100MB disk space
- No Python required

## Configuration

**Development** (default):
- Windowed mode, ESC to exit

**Production** (for toddler use):
```bash
copy config.production.json config.json
```
- Fullscreen, keyboard lock enabled
- Ctrl+Shift+Esc to exit

## Troubleshooting

### Antivirus Warning
PyInstaller executables may trigger false positives. The code is open source and safe.

### Won't Start
- Ensure Windows 7+
- Try running as Administrator
- Verify ZIP fully extracted

### Build Fails
```bash
# Clean and rebuild
rmdir /s build dist
del *.spec
python build.py
```

## Verification

Check download integrity:
```bash
certutil -hashfile toddler-typing-portable-*.zip SHA256
```
Compare with `.sha256` file in releases.
