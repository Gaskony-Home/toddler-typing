# Quick Start Guide - Toddler Typing Android

## For Your Daughter's Tablet

### Step 1: Open in Android Studio

1. Launch **Android Studio**
2. Click **"Open an Existing Project"**
3. Navigate to: `C:\Git\toddler-typing\android`
4. Click **"OK"**

### Step 2: Wait for Gradle Sync

- Android Studio will automatically download dependencies
- This may take a few minutes on first run
- Wait until you see "Gradle sync finished" in the bottom status bar

### Step 3: Connect Your Tablet

1. **Enable Developer Mode** on the tablet:
   - Go to **Settings > About tablet**
   - Tap **"Build number"** 7 times rapidly
   - You'll see a message "You are now a developer!"

2. **Enable USB Debugging**:
   - Go to **Settings > Developer options**
   - Turn on **"USB debugging"**

3. **Connect via USB**:
   - Use a USB cable to connect tablet to your PC
   - On the tablet, tap **"Allow"** when prompted about USB debugging

### Step 4: Run the App

1. In Android Studio, click the green **"Run"** button (▶) at the top
   - Or press **Shift+F10**
2. Select your tablet from the device list
3. Click **"OK"**

The app will build, install, and launch automatically on your tablet!

### Step 5: Test the App

- The app should open in fullscreen mode
- Try the different activities (Letters, Numbers, Drawing, etc.)
- Test that the voice works (tap on letters/numbers)
- Check that progress (stars) is being tracked

## Alternative: Build APK and Install Manually

If you prefer to install the APK directly:

1. In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for the build to complete
3. Click **"locate"** in the notification to find the APK
4. Copy `app-debug.apk` to your tablet (via USB or email)
5. On the tablet, open the APK file to install
   - You may need to allow **"Install from Unknown Sources"**

## Tips for Your Daughter

- The app runs in **landscape mode** (horizontal)
- The **back button is disabled** to prevent accidental exits
- To exit: Press **Home button** on the tablet
- The app is **completely offline** - no internet needed!

## Troubleshooting

**Q: Tablet not appearing in Android Studio?**
- Make sure USB debugging is enabled
- Try a different USB cable
- On tablet, check Settings > Developer options > Select USB Configuration > MTP

**Q: Build errors?**
- Go to **File > Sync Project with Gradle Files**
- If that doesn't work: **Build > Clean Project**, then **Build > Rebuild Project**

**Q: Voice not working?**
- Check tablet volume
- Go to Settings > Language & Input > Text-to-Speech > Install voice data

**Q: App is slow?**
- This is normal on first launch
- Subsequent launches will be faster

## Customization

To change settings, edit these files before building:
- **App name**: `app/src/main/res/values/strings.xml`
- **Colors/theme**: `app/src/main/res/values/colors.xml`
- **Orientation**: `app/src/main/AndroidManifest.xml` (change `android:screenOrientation`)

## Next Steps

Once the app is working well:
1. Build a **Release APK** for better performance:
   - **Build > Generate Signed Bundle / APK**
   - Follow the wizard to create a keystore
2. Share the APK with family/friends
3. Consider publishing to Google Play Store (optional)

Enjoy watching your daughter learn! 🎉
