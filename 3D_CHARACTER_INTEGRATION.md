# 3D Character Integration Documentation

## Overview

A fully integrated 3D dinosaur character system has been implemented for the Toddler Typing application. The character appears on the main menu and reacts to user interactions, voice output, and activity events.

## Current Status

✅ **COMPLETE** - All infrastructure is in place and ready for your GLB model

The integration is **fully functional** and will work as soon as you provide the GLB model file. A fallback emoji character (🦕) will display if no 3D model is present.

---

## What You Need to Provide

### 1. GLB Model File

**Location**: Place your file here:
```
src/toddler_typing/assets/models/dino_character.glb
```

**Required Specifications**:
- **Format**: GLB (Binary glTF 2.0)
- **File Size**: Under 5MB
- **Poly Count**: 5,000-15,000 triangles
- **Texture**: Single 1024x1024 or 2048x2048 texture atlas
- **Rigging**: Full skeletal rig with body, legs, head/neck, tail, and jaw bones

### 2. Required Animations

Your GLB must include these animations with **exact names**:

| Animation Name | Description | Loop |
|---|---|---|
| `idle` | Breathing, subtle movement | Yes |
| `wave` | Greeting wave | No |
| `talk` | Speaking with mouth movement | Yes |
| `happy` | Happy/excited celebration | No |
| `point` | Pointing gesture | No |
| `thinking` | Curious/thinking pose | No |
| `clap` | Clapping/encouragement | No |
| `dance` | Victory dance | No |

**Export from Blender**:
1. File > Export > glTF 2.0 (.glb)
2. Format: glTF Binary (.glb)
3. Include: Selected Objects (character + armature)
4. Transform: +Y Up
5. Animation: Export all animations

**Test Your Model**:
- Online Viewer: https://gltf-viewer.donmccurdy.com/
- Verify all 8 animations play correctly
- Check texture renders properly

---

## Architecture Overview

### Frontend (JavaScript/Three.js)

**CharacterManager** (`web/js/character_manager.js`)
- Handles 3D scene setup, rendering, and animation playback
- Manages WebGL renderer, camera, lighting
- Loads GLB model and controls animation mixer
- Provides fallback emoji if WebGL or model unavailable

**VoiceToAnimationBridge** (`web/js/character_manager.js`)
- Monitors voice output and syncs talking animation
- Intercepts `pywebview.api.speak` calls
- Automatically starts/stops talk animation based on TTS

**Integration Points**:
- `web/index.html` - Character container div
- `web/css/custom.css` - Character positioning and styling
- `web/js/app.js` - Initialization and API bridge

### Backend (Python)

**API Methods** (`src/toddler_typing/api.py`)
- `play_character_animation(animation_name, loop)` - Trigger specific animation
- `set_character_emotion(emotion)` - Change emotional state
- `character_start_talking()` - Start talking animation
- `character_stop_talking()` - Stop talking animation

### Build System

**PyInstaller** (`toddler-typing.spec`)
- Assets directory bundled with executable
- GLB model automatically included in builds

---

## How It Works

### 1. Character Initialization

On app load (`app.js:initApp`):
```javascript
// Create character manager
characterManager = new CharacterManager(containerElement);

// Initialize 3D scene and load model
await characterManager.init();

// Wave hello after 1.5 seconds
setTimeout(() => {
    characterManager.playAnimation('wave', false);
}, 1500);

// Set up voice-to-animation bridge
voiceToAnimationBridge = new VoiceToAnimationBridge(characterManager);
```

### 2. Voice Synchronization

When text-to-speech speaks:
```javascript
// VoiceToAnimationBridge intercepts pywebview.api.speak
pywebview.api.speak("Hello!", true);

// Automatically triggers:
// 1. characterManager.startTalking() → plays 'talk' animation
// 2. Estimates speech duration based on word count
// 3. characterManager.stopTalking() → returns to 'idle'
```

### 3. Activity Reactions

**Letters & Numbers** (`web/js/activities/letters_numbers.js:handleCorrectAnswer`):
```javascript
if (result.level_up) {
    characterManager.playAnimation('dance', false);  // Level up!
} else if (result.star_awarded) {
    characterManager.playAnimation('happy', false);  // Star earned
} else {
    characterManager.playAnimation('clap', false);   // Correct answer
}
```

**Colors & Shapes** (`web/js/activities/colors_shapes.js:handleClick`):
```javascript
// Correct answer
characterManager.playAnimation('happy', false);

// Incorrect answer
characterManager.playAnimation('thinking', false);
```

### 4. Manual Control

From any JavaScript code:
```javascript
// Play specific animation
window.characterManager.playAnimation('wave', false);

// Set emotional state (maps to animation)
window.characterManager.setEmotion('happy');

// From Python API
PythonAPI.playCharacterAnimation('dance');
PythonAPI.setCharacterEmotion('excited');
```

---

## Animation Trigger Map

| Event | Animation | Location |
|---|---|---|
| App loads | `wave` | `app.js:initApp` |
| Voice speaking | `talk` | `VoiceToAnimationBridge` |
| Correct answer | `clap` | `letters_numbers.js` |
| Star awarded | `happy` | `letters_numbers.js` |
| Level up | `dance` | `letters_numbers.js` |
| Correct shape | `happy` | `colors_shapes.js` |
| Wrong shape | `thinking` | `colors_shapes.js` |
| Idle (default) | `idle` | Automatic (always returns to idle) |

---

## Technical Details

### 3D Scene Setup

**Camera**:
- Type: PerspectiveCamera (45° FOV)
- Position: (0, 1.5, 3.5) - slightly above and in front
- Looks at: (0, 0.75, 0) - center of character

**Lighting**:
- Ambient: 0.6 intensity (overall illumination)
- Main Directional: 0.8 intensity, position (2, 3, 2)
- Rim Directional: 0.4 intensity, position (-1, 2, -2)
- Fill Directional: 0.3 intensity, position (-2, 1, 1)

**Rendering**:
- WebGL with alpha transparency
- Anti-aliasing enabled
- Soft shadow maps (PCFSoftShadowMap)
- Pixel ratio capped at 2x for performance
- Automatic window resize handling

**Model Loading**:
- GLTFLoader for .glb files
- Auto-centering using bounding box
- Scaled to fit container (default 1.0 scale)
- All meshes cast and receive shadows

### Animation System

**Mixer**:
- Three.js AnimationMixer for playback
- Smooth blending between animations (0.3s fade)
- One-shot animations return to idle when complete
- Looping animations (idle, talk) continue until stopped

**State Machine**:
- Current state tracked: idle, wave, talk, happy, etc.
- Prevents animation conflicts
- Graceful fallback if animation not found

### Performance Optimization

**Efficient Rendering**:
- 60 FPS target
- Pixel ratio limited to 2x (4K displays)
- Only renders when mixer or idle movement active
- requestAnimationFrame for smooth playback

**Lazy Loading**:
- Model loads asynchronously
- Loading indicator shown during load
- Main app continues if model fails to load

**WebGL Fallback**:
- If WebGL unavailable: Shows animated emoji 🦕
- If model fails: Shows animated emoji 🦕
- Bounce animation as backup entertainment

---

## Character Container Positioning

**CSS** (`web/css/custom.css`):
```css
#character-container {
    position: fixed;
    bottom: 0;
    right: 50%;
    transform: translateX(50%);
    width: clamp(250px, 30vw, 400px);
    height: clamp(250px, 30vh, 400px);
    z-index: 50;
    pointer-events: none;  /* Allows clicking through */
}
```

**Responsive**:
- Desktop: 250-400px (centered at bottom)
- Tablet: 200-300px (bottom-right corner)
- Mobile: 180px (bottom-right, smaller)

**Animations**:
- Slide-in entrance animation (1s delay)
- Loading spinner while model loads
- Hidden during activities (main menu only)

---

## Testing Checklist

### Before Providing GLB

- [ ] Model has all 8 required animations
- [ ] Animation names are exact (lowercase: idle, wave, talk, etc.)
- [ ] Texture is embedded in GLB
- [ ] File size under 5MB
- [ ] Tested in https://gltf-viewer.donmccurdy.com/
- [ ] Model faces +Z direction in Blender
- [ ] Rigging includes jaw bone for talk animation

### After Integration

1. **Build the app**: `python build.py`
2. **Run the executable**: `./dist/toddler-typing/toddler-typing.exe`
3. **Verify**:
   - [ ] Character appears on main menu
   - [ ] Wave animation plays after 1.5 seconds
   - [ ] Character talks when voice speaks
   - [ ] Character celebrates on correct letters/numbers
   - [ ] Character reacts to colors & shapes clicks
   - [ ] Smooth 60 FPS rendering
   - [ ] Works on Windows/Mac/Linux (if applicable)

### If Model Doesn't Load

Check browser console (F12) for errors:
- Missing GLB file: Place at `assets/models/dino_character.glb`
- WebGL not available: Fallback emoji will show
- Animation not found: Check animation names in GLB
- Loading failed: Verify GLB file is valid glTF 2.0

---

## Extending the Character

### Add New Animation Triggers

**In JavaScript**:
```javascript
// In any activity file
if (window.characterManager) {
    window.characterManager.playAnimation('custom_animation', false);
}
```

**In Python**:
```python
# In api.py or anywhere with access to API
result = self.play_character_animation('custom_animation')
```

### Add New Emotions

Edit `CharacterManager.setEmotion()` in `character_manager.js`:
```javascript
setEmotion(emotion) {
    const emotionMap = {
        'happy': 'happy',
        'excited': 'happy',
        'celebrate': 'celebrate',
        'custom_emotion': 'custom_animation',  // Add here
        // ...
    };

    const animationName = emotionMap[emotion.toLowerCase()] || 'idle';
    this.playAnimation(animationName);
}
```

### Add Character Click Interaction

In `character_manager.js:setupRenderer()`:
```javascript
// Remove pointer-events: none from CSS first
this.container.style.pointerEvents = 'auto';

// Add click handler
this.container.addEventListener('click', () => {
    const randomAnimations = ['wave', 'clap', 'dance'];
    const random = randomAnimations[Math.floor(Math.random() * randomAnimations.length)];
    this.playAnimation(random, false);
});
```

---

## Troubleshooting

### Character Not Appearing

**Check**:
1. GLB file exists at `assets/models/dino_character.glb`
2. Browser console (F12) for errors
3. WebGL is supported: Visit https://get.webgl.org/

**Solutions**:
- If GLB missing: Emoji fallback will show
- If WebGL unsupported: Emoji fallback will show
- If permissions issue: Check file can be read

### Animations Not Playing

**Check**:
1. Animation names in GLB match exactly (case-sensitive)
2. Browser console shows animation list when model loads
3. CharacterManager is initialized: `window.characterManager !== null`

**Solutions**:
- Re-export GLB with correct animation names
- Verify animations in gltf-viewer.donmccurdy.com
- Check `CharacterManager.animations` object in console

### Character Talking But Not Moving

**Check**:
1. GLB has `talk` animation
2. Talk animation includes jaw/mouth bones
3. VoiceToAnimationBridge is initialized

**Solutions**:
- Add talk animation to GLB with mouth movement
- Check console for VoiceToAnimationBridge initialization
- Verify `window.voiceToAnimationBridge !== null`

### Performance Issues / Low FPS

**Check**:
1. Model poly count (target: <15k triangles)
2. Texture resolution (target: 2048x2048 max)
3. Multiple lights in scene

**Solutions**:
- Reduce poly count in 3D software
- Compress textures to smaller resolution
- Adjust `config.ambientLightIntensity` values
- Set `renderer.setPixelRatio(1)` for lower-end devices

### Character Appears Too Large/Small

**Adjust** in `character_manager.js:config`:
```javascript
this.config = {
    modelScale: 1.2,  // Increase to make larger
    cameraDistance: 3.5,  // Increase to move camera back
    // ...
};
```

**Or** in CSS for container:
```css
#character-container {
    width: clamp(300px, 35vw, 500px);  /* Adjust sizes */
    height: clamp(300px, 35vh, 500px);
}
```

---

## File Structure

```
toddler-typing/
├── src/toddler_typing/
│   ├── assets/
│   │   └── models/
│   │       ├── README.md              # Model specifications
│   │       └── dino_character.glb     # YOUR FILE GOES HERE
│   ├── web/
│   │   ├── index.html                 # Character container
│   │   ├── css/
│   │   │   └── custom.css             # Character styling
│   │   └── js/
│   │       ├── app.js                 # Initialization
│   │       ├── character_manager.js   # 3D rendering
│   │       └── activities/
│   │           ├── letters_numbers.js # Activity integration
│   │           └── colors_shapes.js   # Activity integration
│   ├── api.py                         # Python API methods
│   └── audio/
│       └── voice_manager.py           # TTS (no changes needed)
├── toddler-typing.spec                # PyInstaller config
└── 3D_CHARACTER_INTEGRATION.md        # This file
```

---

## Summary

The 3D character system is **100% complete and ready to use**. Simply:

1. **Create your GLB model** with the 8 required animations
2. **Place it** at `src/toddler_typing/assets/models/dino_character.glb`
3. **Build the app**: `python build.py`
4. **Run and enjoy** the dinosaur character!

The character will:
- ✅ Appear on the main menu (centered at bottom)
- ✅ Wave hello when the app starts
- ✅ Talk when voice speaks (with mouth movement)
- ✅ React to correct answers with celebrations
- ✅ Show curiosity on mistakes
- ✅ Celebrate level-ups with a dance
- ✅ Return to idle breathing animation between actions

If the GLB is not present, a friendly emoji dinosaur (🦕) will bounce as a fallback.

---

## Next Steps (Optional Enhancements)

Future improvements you could add:

1. **Character Evolution**:
   - Swap GLB models based on level (baby → adult → master)
   - Track in `progress_manager.py` and switch models

2. **More Reactions**:
   - Add "sleeping" animation for inactivity
   - Add "pointing" animation for menu hovering
   - Add "proud" animation for achievements

3. **Voice Lip Sync**:
   - Replace speech duration estimate with actual phoneme data
   - Use Web Speech API for more accurate sync

4. **Character Customization**:
   - Let kids choose character color/appearance
   - Store preference in progress.json

5. **Interactive Character**:
   - Enable clicking character for random animation
   - Add character dialogue/hints system

6. **Sound Effects**:
   - Add footstep sounds for dance animation
   - Add clapping sound effects
   - Background ambient sounds

---

**Need Help?** Check the console logs for detailed debugging information. All character-related logs are prefixed with `[CharacterManager]` or `[VoiceToAnimationBridge]`.
