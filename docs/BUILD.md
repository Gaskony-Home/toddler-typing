# Build Guide

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm

## Development

```bash
# Install dependencies
npm install

# Run the app
npm start
```

## Packaging

### Package (unpacked app)

```bash
npm run package
```

Creates an unpacked app in `out/` ready to run.

### Create Installer

```bash
npm run make
```

Creates platform-specific installers:
- **Windows**: Squirrel installer + ZIP
- **macOS**: ZIP
- **Linux**: ZIP

Output goes to `out/make/`.

## What You Get

### Windows
```
out/make/squirrel.windows/x64/
├── ToddlerTypingSetup.exe    # Installer
└── toddler-typing-*.nupkg   # Update package
```

### All Platforms
```
out/make/zip/
└── toddler-typing-*.zip     # Portable ZIP
```

## Publishing

The app uses `@electron-forge/publisher-github` to publish releases:

```bash
# Set GitHub token
export GITHUB_TOKEN=your_token_here

# Publish
npx electron-forge publish
```

This uploads the built artifacts to GitHub Releases, which enables auto-updates for installed users.

## Auto-Updates

The app checks for updates from GitHub Releases on startup using `electron-updater`. When a new release is published:

1. Users see an update notification button in the header
2. Clicking it shows version info and a download button
3. The update downloads in the background
4. App restarts to apply the update

## System Requirements

- Windows 10+, macOS 10.15+, or Linux (x64)
- ~200MB disk space
- No additional runtime needed
