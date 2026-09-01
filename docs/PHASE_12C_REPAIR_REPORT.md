# CALYXO — PHASE 12C: PHYSICAL-DEVICE-FIRST ROOT CAUSE REPAIR REPORT

**Authoritative Documentation & Repair Ledger**  
**Phase**: Phase 12C Forensic Root Cause Repair  
**Status**: AUTOMATED VERIFICATION COMPLETE · PHYSICAL IPHONE EXECUTION: `NOT VERIFIED (Awaiting Real iPhone Test Run)`  
**Baseline Acceptance**: Phase 12 & Phase 12B automated assertions are **NOT accepted** as physical device proof. Physical iPhone execution is the sole ground truth.

---

## 1. Executive Summary & Root Cause Forensic Findings

During physical iPhone testing, several release-critical defects were identified:
1. **HealthKit Authority & Premature Connection**: The application's UI previously relied on optimistic flags or non-zero steps, falsely indicating Apple Health connection before native iOS `HKHealthStore` permissions were granted.
2. **Light Mode Theme Bleed**: Hardcoded dark-mode background and border classes (`#0A0A0F`, `#12121A`, `border-white/10`, `text-white`) inside `OnboardingFlow.js`, `HealthKitAuthorizationModal.jsx`, and `WearablePairingModal.jsx` caused Light Mode to render pitch-black surfaces with illegible contrast.
3. **Premature Settings Redirect**: Tapping Apple Health in onboarding previously redirected users directly to iOS Settings or assumed permission was granted without invoking the native HealthKit authorization prompt.
4. **External Revocation Desync**: When users revoked permissions in iOS Settings -> Health -> Calyxo, returning to Calyxo did not automatically reconcile the UI state.
5. **Subscription Timeline Presentation**: Subscription dates required canonical label mapping without synthetic date fabrication.

---

## 2. Root Cause Code Repairs Implemented

### P0. HealthKit Single Source of Truth & Native Authority
- **Native iOS Plugin (`ios/App/App/CalyxoHealthKitPlugin.swift`)**:
  - Upgraded `checkAuthorizationStatus()`: Directly queries `healthStore.authorizationStatus(for: energyType)` and returns canonical state strings: `NOT_AVAILABLE`, `NOT_DETERMINED`, `DENIED`, `AUTHORIZED`.
  - Upgraded `requestAuthorization()`: Bridges to `AppDelegate.requestHealthKitAuthorization()`, invokes `HKHealthStore.requestAuthorization(toShare:read:)`, and performs an immediate post-prompt status query returning authoritative status.
- **Health Permission Service (`src/services/health/HealthPermissionManager.js`)**:
  - Implemented `checkLiveAuthorizationStatus()` and `checkLiveAuthorization()`: If native query reports anything other than `AUTHORIZED`, automatically purges stale `localStorage` flags and sets state to disconnected.
  - Implemented `getDetailedStatus()` returning `{ platform, authorized, statusString, available }`.
- **Onboarding Device Flow (`src/components/OnboardingFlow.js`)**:
  - Initial state strictly set to `appleHealth: false, appleWatch: false`.
  - Tapping "Apple Watch & Apple Health" invokes `HealthPermissionManager.requestPermissions()`.
  - Toggle switch visually updates to ON **only after** native authorization returns `authorized: true` / `hasRequired: true`.
  - Removed all premature redirects to Settings.
- **Lifecycle Reconciliation (`src/components/health/HealthHubPage.jsx` & `src/components/PermissionsConnectionsSection.jsx`)**:
  - Attached `focus` and `visibilitychange` window event listeners calling `checkLiveAuthorization()`.
  - External permission revocation in iOS Settings immediately updates the UI toggle to disconnected upon returning to Calyxo.

### P0. Complete Light Mode & Dark Mode Theming Repair
- **Root Cause Eliminated**:
  - Replaced hardcoded `#0A0A0F`, `#12121A`, `border-white/10`, `text-slate-400`, and `text-white` classes with semantic design tokens:
    - Container background: `bg-background text-foreground` (`#F8FAFC` in Light Mode, `#0A0A0C` in Dark Mode).
    - Card surfaces: `bg-surface border border-card-border` (`#FFFFFF` / `#E2E8F0` in Light Mode, `#131317` / `rgba(255,255,255,0.08)` in Dark Mode).
    - Text hierarchy: `text-foreground` (`#0F172A` in Light Mode, `#F8FAFC` in Dark Mode), `text-muted` (`#64748B` in Light Mode, `#94A3B8` in Dark Mode).
    - Inputs & Textareas: `bg-card-bg border border-card-border text-foreground placeholder:text-muted focus:border-accent`.
    - iOS Toggle Switch: `bg-[#34C759]` when active; `bg-slate-300 dark:bg-slate-700` when inactive.
    - Buttons: `bg-accent text-accent-foreground` for primary actions; `bg-surface border border-card-border text-foreground` for secondary actions.
- **Files Re-themed**:
  - `src/components/OnboardingFlow.js` (All 12 onboarding screens, header, navigation pills, and footer).
  - `src/components/modals/HealthKitAuthorizationModal.jsx`.
  - `src/components/modals/WearablePairingModal.jsx`.
  - `src/components/health/HealthConnectionsModal.jsx`.
  - `src/components/health/HealthSettingsModal.jsx`.
  - `src/components/PermissionsConnectionsSection.jsx`.
  - `src/components/health/HealthHubPage.jsx`.

### P1. Health Hub Responsiveness & Layout
- Replaced fixed widths with fluid responsive classes (`grid-cols-1 sm:grid-cols-2`, `grid-cols-2 sm:grid-cols-4`, `grid-cols-1 sm:grid-cols-3`).
- Added safe-area padding (`pb-[calc(1rem+env(safe-area-inset-bottom,0px))]`) and overflow scrolling across all modals to eliminate text clipping on iPhone SE, iPhone 14, iPhone 15, and iPhone 16 Pro viewports.

### P1. Subscription Timeline Canonical Presentation
- `SubscriptionManager.getSubscriptionTimeline()` returns real timestamps and canonical status strings ("Next billing date", "Active until", "Expires") without synthetic date fabrication.
- Rendered in local user timezone inside `SettingsDrawerPanel.jsx`.

---

## 3. Real iPhone Verification Matrix (Ground Truth Ledger)

| ID | Test Scenario | Expected Ground Truth Behavior | Automated Status | Physical iPhone Status |
|:---|:---|:---|:---|:---|
| **TC-01** | Fresh Install First-Time Onboarding | Apple Health toggle starts OFF (`NOT_DETERMINED`). No automatic Settings redirect. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-02** | HealthKit Authorization Sheet | Tapping toggle triggers native iOS permission prompt (`HKHealthStore.requestAuthorization`). | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-03** | HealthKit Permission Granted | User taps "Turn All Categories On" / "Allow". Toggle turns ON; real telemetry streams. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-04** | HealthKit Permission Denied | User taps "Don't Allow". Toggle remains OFF; polite prompt shown; no crash. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-05** | External Revocation in iOS Settings | Permissions revoked in Settings -> Health -> Calyxo. App returns -> Toggle immediately OFF. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-06** | Reconnect Apple Health from Health Hub | Reconnect triggers real HealthKit check + telemetry refresh. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-07** | Light Mode Appearance across Onboarding & Modals | Clean `#F8FAFC` background, white `#FFFFFF` cards, `#0F172A` text, zero dark bleed. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-08** | Dark Mode Appearance across Onboarding & Modals | Sleek `#0A0A0C` background, `#131317` cards, high contrast `#F8FAFC` text, vibrant accent. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-09** | Responsive Layout (Narrow Viewports) | No horizontal scrolling or text clipping on 375pt, 393pt, or 430pt displays. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |
| **TC-10** | Subscription Timeline Rendering | Accurate billing/expiry date in local format; zero fabricated dates. | `AUTOMATED VERIFIED` | `NOT VERIFIED (Awaiting Real iPhone Test Run)` |

---

## 4. Protected Product Rules Adherence Check

1. **Root URL Navigation**: Root URL `http://localhost:5173/` (`/`) strictly renders `LandingPage` with zero automatic redirection to `/user/dashboard` or `/trainer/dashboard`.
2. **Gemini API Service**: `src/services/geminiService.js` and `api/gemini.js` were preserved intact with zero modifications.
3. **Database Schema**: `CALYXO_MASTER_SUPABASE_SCHEMA.sql` preserved without destructive alteration.
4. **Code Quality**: ESLint ran with 0 errors and 0 warnings. Production build succeeds cleanly.
