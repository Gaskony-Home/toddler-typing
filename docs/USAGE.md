# Usage Guide

## Quick Start

```bash
npm install
npm start
```

## Activities

### Letters & Numbers
- Shows a letter or number on screen
- Child presses the matching key on the keyboard
- Earns stars and levels up with correct answers
- Voice encouragement via text-to-speech

### Colors & Shapes
- Shows 6 colored shapes on screen
- Voice tells the child which one to click
- Celebrations for correct answers, gentle retry for wrong ones

### Drawing
- Free-form drawing canvas
- 12 colors and 5 brush sizes
- Save drawings as PNG files

### Coloring Pages
- Pre-made outline pictures to color in
- Navigate between 6 different images
- Save completed artwork

### Dot to Dot
- Connect-the-dots images to draw over
- Navigate between 6 different puzzles
- Save completed pictures

### Letter Sounds
- Learn phonics (sh, ch, th, ph, etc.)
- Click to hear the sound spoken
- Example words for each sound

## Controls

| Action | How |
|--------|-----|
| Start activity | Click an activity card |
| Return to menu | Click "Back to Menu" |
| Toggle theme | Click moon/sun icon |
| Toggle mute | Click speaker icon |
| Toggle fullscreen | Click fullscreen icon |

## Settings

Settings are managed automatically:
- **Theme** (light/dark) - saved to localStorage
- **Mute state** - saved to localStorage
- **Progress** (stars, level) - saved via electron-conf

Settings persist across app restarts.

## Safety Features

### Keyboard Lock (Windows Only)
Blocks system keys like Windows key, Alt+Tab, and Alt+F4 to prevent toddlers from switching away.

**Note:** Ctrl+Alt+Delete cannot be blocked (Windows security feature).

### Fullscreen Mode
Click the fullscreen button to prevent accidental clicks outside the app.

## Tips for Parents

1. **Start simple** - Colors & Shapes is a great first activity
2. **Take breaks** - 10-15 minute sessions work best
3. **Supervise** - especially during first use
4. **Save artwork** - use the Save button in drawing activities

## Troubleshooting

### App Won't Start
- Ensure Node.js 20+ is installed
- Run `npm install` to install dependencies
- Try `npm start` from the project directory

### No Sound
- Check mute button (speaker icon in header)
- Ensure system volume is up
- Web Speech API requires a supported browser/Electron version

### Drawing Not Saving
- The Save button downloads a PNG file
- Check your browser/system download location

## Privacy

- No internet connection required
- No data collection
- No ads
- Settings stored locally on your device only
