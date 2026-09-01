# CALYXO — PHASE 12: NATIVE UX BUG AUDIT & ROOT-CAUSE RESOLUTION

---

## 1. Executive Summary

During native physical device validation across iOS 18.2 (Apple Health / CoreMotion) and Android 15 (Health Connect / SensorManager), a series of real-world UX and authorization synchronization bugs were discovered. Phase 12 resolves every root-cause issue, enforcing zero data fabrication, strict state reconciliation between native and cloud data stores, light/dark mode contrast compliance, and subscription timeline clarity.

---

## 2. Forensic Audit Matrix

| Issue # | Symptom | Forensic Root Cause | Resolution | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | New users saw Health access as enabled upon initial launch | `HealthPermissionManager.checkLiveAuthorization()` treated `queryTodayMetrics()` returning `{ steps: 0 }` as truthy authorization. | Updated `checkLiveAuthorization()` to check `checkAuthorizationStatus().authorized === true`. Onboarding state now truthfully defaults to disconnected until explicit native grant. | **RESOLVED & VERIFIED** |
| **BUG-02** | Tapping Health access during onboarding prematurely redirected to iOS Settings | `OnboardingFlow.js` immediately invoked `HealthPermissionManager.openHealthSettings()` whenever steps were 0, bypassing the native permission prompt flow. | Removed premature Settings redirect from normal connection flow. Modal authorization now triggers the genuine OS permission sheet. | **RESOLVED & VERIFIED** |
| **BUG-03** | Reconnect Apple Health reported "Synced" without proving actual data transfer | `CalyxoNativeHealthKitManager.swift` marked state `.synced` simply because `httpError == nil` (ignoring HTTP 400/401/500 Supabase status codes) and returned success even for unauthenticated sessions. | Replaced with strict session check (`!session.userUUID.isEmpty`), HTTP 200..299 validation, and granular state transitions (`.connectedNoData`, `.connectedWithData`, `.synced`, `.syncFailed`). | **RESOLVED & VERIFIED** |
| **BUG-04** | Hardcoded sleep metric `7.4 hrs` displayed on native Dashboard | `CalyxoNativeDashboardView.swift` hardcoded `value: "7.4"` in the biometric tile. | Replaced with dynamic snapshot binding `healthManager.currentSnapshot.sleepHours > 0 ? "\(healthManager.currentSnapshot.sleepHours)" : "--"`. Zero fake biometrics. | **RESOLVED & VERIFIED** |
| **BUG-05** | Light mode text was unreadable / low contrast in SwiftUI views | Native SwiftUI views hardcoded `.foregroundColor(.white)` and `.foregroundColor(.gray)` across cards, tickers, and labels instead of using adaptive semantic design tokens. | Replaced all hardcoded colors with `CalyxoDesignTokens.Colors.textPrimary` and `CalyxoDesignTokens.Colors.textSecondary`. | **RESOLVED & VERIFIED** |
| **BUG-06** | Subscription UI did not display next billing / renewal date | `SettingsDrawerPanel.jsx` lacked a canonical timeline calculation helper, rendering plan tier without renewal date. | Created `SubscriptionManager.getSubscriptionTimeline(userProfile, user)` returning "Next billing date", "Active until", or "Expires" without date fabrication. | **RESOLVED & VERIFIED** |
| **BUG-07** | Health Hub Settings & Connections modals clipped on narrow screens | Modals used rigid `grid-cols-3` and `grid-cols-4` layouts without responsive wrapping on small mobile screens. | Converted to responsive grid breakpoints (`grid-cols-1 sm:grid-cols-2`, `grid-cols-2 sm:grid-cols-4`, `grid-cols-1 sm:grid-cols-3`). | **RESOLVED & VERIFIED** |

---

## 3. Engineering Invariants Maintained

1. **Protected Production Web/PWA Baseline**: No regressions in `src/App.jsx`, `src/lib/supabaseClient.js`, `src/lib/dbService.js`, `capacitor.config.json`, or `vite.config.mjs`.
2. **Routing Invariant**: Navigating to `/` renders the LandingPage component without redirects to `/user/dashboard`.
3. **Gemini Invariant**: `src/services/geminiService.js` and `api/gemini.js` remained completely untouched.
4. **No Schema Migrations**: All fixes executed via native Swift, Java, and frontend state contracts without breaking database schema.
