# CALYXO — PHASE 9 PHYSICAL DEVICE TESTBED MATRIX

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 9 — Multi-Platform Physical & Environmental Verification Matrix  
**Date**: August 28, 2026  

---

## 1. Verification Level Definitions

To maintain absolute architectural integrity, verification states are strictly segregated:

- `CODE VERIFIED`: Structural verification via static analysis, code review, and type safety.
- `AUTOMATED VERIFIED`: Validated by deterministic automated test runners.
- `SIMULATOR VERIFIED`: Validated inside Xcode Simulator or Android Studio Emulator.
- `PHYSICAL VERIFIED`: Validated on real consumer hardware in hand.
- `NOT VERIFIED`: Hardware unavailable in the current CI/agent environment.
- `BLOCKED`: Prevented by an active environment blocker or defect.

---

## 2. Multi-Platform Device Matrix

| Subsystem / Test Case | iOS Status | Android Status | Apple Watch Status | BLE Hardware Status |
| :--- | :--- | :--- | :--- | :--- |
| **Cold Boot & Auth Restore** | `AUTOMATED VERIFIED` | `AUTOMATED VERIFIED` | N/A | N/A |
| **Deep Link: calyxo://auth** | `AUTOMATED VERIFIED` | `AUTOMATED VERIFIED` | N/A | N/A |
| **HealthKit / Health Connect**| `CODE VERIFIED` | `CODE VERIFIED` | `CODE VERIFIED` | N/A |
| **BLE 9-State FSM** | `AUTOMATED VERIFIED` | `AUTOMATED VERIFIED` | N/A | `NOT VERIFIED (HW)` |
| **Workout Volume Engine** | `AUTOMATED VERIFIED` | `AUTOMATED VERIFIED` | `CODE VERIFIED` | N/A |
| **Nutrition Macro Scaling** | `AUTOMATED VERIFIED` | `AUTOMATED VERIFIED` | N/A | N/A |
| **AI Truthfulness Constraints**| `AUTOMATED VERIFIED`| `AUTOMATED VERIFIED`| N/A | N/A |
| **Rest Timer HUD / Live Activity**| `CODE VERIFIED` | `CODE VERIFIED` | `CODE VERIFIED` | N/A |
| **Offline Outbox & Sync Retry**| `AUTOMATED VERIFIED`| `AUTOMATED VERIFIED`| `CODE VERIFIED` | N/A |
| **Background Reconnection** | `CODE VERIFIED` | `CODE VERIFIED` | `CODE VERIFIED` | `NOT VERIFIED (HW)` |
| **Physical iPhone in Hand** | `NOT VERIFIED (HW)` | N/A | N/A | N/A |
| **Physical Pixel in Hand** | N/A | `NOT VERIFIED (HW)` | N/A | N/A |
| **Physical Apple Watch in Hand**| N/A | N/A | `NOT VERIFIED (HW)` | N/A |
| **Physical BLE Chest Strap** | N/A | N/A | N/A | `NOT VERIFIED (HW)` |
