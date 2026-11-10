# Calyxo Android builds

APK/AAB files are **not** committed to git (GitHub file size limits). Keep them under local `releases/` (gitignored).

## Current version
- `versionName`: **1.0.3**
- `versionCode`: **4**
- Defined in `android/app/build.gradle`

## Build a release APK (requires JDK 17+)

```bash
cd CALYXOAPP
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

Copy output to `releases/Calyxo-v1.0.3.apk` and publish via **GitHub Releases**.
