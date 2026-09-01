# CALYXO — PHASE 10 ANDROID GOOGLE PLAY RELEASE STAGING CHECKLIST

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Target**: Google Play Console & Internal Testing Track  
**Application ID**: `com.calyxo.app`  
**Date**: August 28, 2026  

---

## 1. Release Keystore & Signing

- [ ] **Release Keystore**: Valid upload keystore (`calyxo-release.keystore`).
- [ ] **Signing Config**: Configured in `android/app/build.gradle`.
- [ ] **Play App Signing**: Play Integrity API enabled.
- [ ] **Signing Status**: `BLOCKED — HUMAN ACTION REQUIRED` (Keystore file and alias secrets must be provided in build environment).

---

## 2. Manifest Permissions & Requirements

- [x] `android.permission.BODY_SENSORS`: Real-time heart rate monitoring
- [x] `android.permission.BLUETOOTH_SCAN`: BLE peripheral discovery
- [x] `android.permission.BLUETOOTH_CONNECT`: BLE connection management
- [x] `android.permission.POST_NOTIFICATIONS`: Android 13+ smart reminders
- [x] `androidx.health.connect.client`: Health Connect aggregate reads (Steps, Sleep, Active Energy)

---

## 3. Deep-Link Intent Filter

- [x] **Scheme**: `calyxo`
- [x] **Host**: `auth`
- [x] **Path**: `/callback`

---

## 4. ProGuard / R8 Rules

- [x] Preserve Supabase PostgREST DTOs
- [x] Preserve Health Connect data models
- [x] Preserve encrypted storage keystore wrappers
