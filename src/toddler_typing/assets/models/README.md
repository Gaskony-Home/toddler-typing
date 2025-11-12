# 3D Character Models

This directory contains 3D character models for the Toddler Typing application.

## Required File

Place the dinosaur character file here:
- `dino_character.glb` - Main character model with animations

## GLB File Specifications

### Format
- **File Format**: GLB (Binary glTF 2.0)
- **File Size**: Target under 5MB
- **Poly Count**: 5,000-15,000 triangles

### Required Animations

The GLB file must include these animations (with exact names):

1. **idle** - Default breathing/idle animation (looping)
2. **wave** - Greeting wave animation (one-shot)
3. **talk** - Speaking/talking animation with mouth movement (looping)
4. **happy** - Happy/excited celebration animation (one-shot)
5. **point** - Pointing gesture toward activities (one-shot)
6. **thinking** - Curious/thinking pose (one-shot)
7. **clap** - Clapping/encouragement animation (one-shot)
8. **dance** - Victory dance for major celebrations (one-shot)

### Technical Requirements

- **Texture**: Single 1024x1024 or 2048x2048 texture atlas
- **Rigging**: Full skeletal rig with:
  - Body bones (spine, hips, tail)
  - Leg bones (4 legs for quadruped)
  - Head/neck bones
  - Jaw bone for talking animation
- **Materials**: PBR materials (glTF standard)
- **Orientation**: Model should face +Z direction in Blender

### Exporting from Blender

1. Select your character and armature
2. File > Export > glTF 2.0 (.glb)
3. Settings:
   - Format: glTF Binary (.glb)
   - Include: Selected Objects
   - Transform: +Y Up
   - Data: Compression enabled
   - Animation: Export all animations, enable NLA Strips if using
4. Save as `dino_character.glb`

### Testing

Test your GLB file before integration:
- Online viewer: https://gltf-viewer.donmccurdy.com/
- Verify all animations play correctly
- Check texture appears correctly
- Confirm file size is under 5MB

## Fallback

If no GLB file is present, the application will automatically fall back to a simple emoji (🦕) with bounce animation.
