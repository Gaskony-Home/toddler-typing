# toddler-typing — Claude context

Offline educational Electron + Android app for toddlers (see [README.md](README.md)
for features and [ROADMAP.md](ROADMAP.md) for planned work). No backend, no
telemetry — everything is local by design; keep it that way.

## Rules for working here

1. **CI is green and must stay green** — `.github/workflows/test.yml` runs on push,
   `release.yml` builds installers on tags. Run the tests before pushing.
2. TTS is **sherpa-onnx, fully offline** (`npm run setup:tts` downloads models into
   `resources/`, which is gitignored ~195MB). Never swap in a cloud TTS.
3. The web assets exist in TWO tracked copies: `src/toddler_typing/web/` (Electron)
   and `android/app/src/main/assets/web/` (Android). **`npm run sync-android` copies
   Electron → Android** — edit the Electron copy, then sync; never hand-edit the
   Android copy.
4. Builds: `npm run dist:win|mac|linux` (Electron installers); Android via the
   `android/` Gradle project after `sync-android`.
5. Audience is ages 2–5: any UI change must survive random mashing — guard
   against navigation escapes and keep touch targets huge.
