# Toddler Typing - Android Version

This is the Android version of Toddler Typing, a child-friendly educational app designed for toddlers (ages 2-5) to safely interact with tablets.

## Features

- **Educational Activities**:
  - Letters and numbers learning
  - Drawing canvas
  - Colors and shapes exploration
  - Coloring activities
  - Dot-to-dot games

- **Child-Friendly**: Large, colorful buttons and engaging visual design
- **Text-to-Speech**: Native Android TTS for audio feedback
- **Progress Tracking**: Stars and levels to encourage learning
- **Fullscreen Mode**: Immersive experience optimized for tablets
- **Offline**: No internet connection required after installation

## Requirements

- Android 7.0 (API 24) or higher
- Recommended: 10-inch tablet for best experience

## Building the App

### Prerequisites

1. Install [Android Studio](https://developer.android.com/studio)
2. Android SDK API 34 or higher
3. Kotlin 1.9.20 or higher

### Build Steps

1. **Open the project in Android Studio**:
   - Launch Android Studio
   - Select "Open an Existing Project"
   - Navigate to the `android` folder and select it

2. **Sync Gradle**:
   - Android Studio will automatically sync the Gradle files
   - Wait for the sync to complete

3. **Update SDK path** (if needed):
   - Edit `local.properties` to set your Android SDK path
   - Example: `sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk`

4. **Build the app**:
   - Click `Build > Make Project` or press `Ctrl+F9`
   - Or click `Run > Run 'app'` to build and install on a connected device

5. **Generate APK**:
   - Click `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - The APK will be generated in `app/build/outputs/apk/debug/`

### Installing on Your Tablet

#### Method 1: Direct Install (Recommended)
1. Connect your tablet to your computer via USB
2. Enable Developer Mode and USB Debugging on your tablet:
   - Go to Settings > About tablet
   - Tap "Build number" 7 times to enable Developer Mode
   - Go to Settings > Developer options
   - Enable "USB debugging"
3. In Android Studio, click the green "Run" button
4. Select your tablet from the device list

#### Method 2: APK Install
1. Build the APK (see step 5 above)
2. Copy the APK to your tablet (via USB, email, or cloud storage)
3. On your tablet, open the APK file and install it
4. You may need to allow "Install from Unknown Sources" in Settings

## Architecture

This Android app uses:
- **Kotlin** for the native Android code
- **WebView** to display the HTML/CSS/JS frontend
- **JavaScript Bridge** to connect the web UI to native Android features
- **Native Android APIs** for:
  - Text-to-Speech (TTS)
  - SharedPreferences (settings and progress storage)
  - Fullscreen/immersive mode

The app reuses the web frontend from the desktop version while implementing the Python backend features in Kotlin.

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/toddlertyping/
│   │   │   ├── MainActivity.kt           # Main activity
│   │   │   ├── api/
│   │   │   │   └── ToddlerTypingAPI.kt   # JavaScript bridge
│   │   │   └── managers/
│   │   │       ├── VoiceManager.kt       # TTS management
│   │   │       ├── ProgressManager.kt    # Progress tracking
│   │   │       └── SettingsManager.kt    # Settings storage
│   │   ├── res/                          # Android resources
│   │   └── assets/web/                   # Web frontend files
│   └── build.gradle                      # App-level Gradle config
├── gradle/                               # Gradle wrapper
├── build.gradle                          # Project-level Gradle config
└── settings.gradle                       # Gradle settings
```

## Configuration

The app is optimized for:
- **Landscape orientation** (best for tablets)
- **Fullscreen/immersive mode** (hides navigation bars)
- **10-inch tablets** (but works on phones too)

## Safety Features

- **Immersive Mode**: Fullscreen mode prevents accidental navigation
- **Back Button Disabled**: Prevents toddlers from accidentally exiting
- **Offline Operation**: No network access required
- **No Data Collection**: All data stays on the device

## Troubleshooting

### Build Errors

1. **SDK not found**: Update `local.properties` with your Android SDK path
2. **Gradle sync failed**: Check your internet connection and try `File > Sync Project with Gradle Files`
3. **Kotlin version mismatch**: Ensure you have Kotlin 1.9.20 or compatible version

### Runtime Issues

1. **TTS not working**: Make sure Android TTS is installed on your device (Settings > Language & Input > Text-to-Speech)
2. **Web assets not loading**: Clean and rebuild the project (`Build > Clean Project`, then `Build > Rebuild Project`)
3. **App crashes on startup**: Check Logcat in Android Studio for error messages

## Testing on Emulator

To test on an Android emulator:
1. Open AVD Manager in Android Studio (`Tools > Device Manager`)
2. Create a new device with:
   - API Level 24 or higher
   - Screen size: 10.1" tablet
   - Orientation: Landscape
3. Start the emulator and run the app

## License

MIT License - Same as the desktop version

## Support

For issues or questions about the Android version, please create an issue in the main repository.
