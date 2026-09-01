# CALYXO — PHASE 12: PHYSICAL DEVICE & SIMULATOR VALIDATION REPORT

---

## 1. Physical Validation Environment

- **iOS Target**: iPhone 16 Pro Max, iPhone SE (3rd Gen) / iOS 18.2 SDK
- **Android Target**: Google Pixel 9 Pro, Samsung Galaxy S24 / Android 15 (API 35)
- **Web / PWA**: Chromium 133 / Mobile Safari / PWA Standalone Mode

---

## 2. Test Execution & Physical Flow Verification

### Test 1: Onboarding HealthKit Authorization Truthfulness
- **Step**: Install fresh build, sign up with new account, navigate through onboarding to Device Connection screen.
- **Observed Result**:
  - Apple Health toggle is `OFF` by default.
  - Tapping "Connect" triggers genuine iOS `HKHealthStore.requestAuthorization()` sheet with read/write category selectors.
  - If user taps "Don't Allow", the toggle remains `OFF` and no redirection occurs.
  - If user taps "Allow", the toggle transitions to `Connected`, and actual HealthKit metrics stream immediately.
- **Result**: **PASS**

### Test 2: Reconnection & Real Backend Sync Verification
- **Step**: Disconnect Apple Health, then tap "Reconnect Apple Health" in Health Hub.
- **Observed Result**:
  - State transitions cleanly: `Requesting Authorization` → `Syncing` → `Synced` (upon HTTP 200 from Supabase outbox).
  - If session token is invalidated, state transitions to `Sync Failed` with clear recovery hint.
  - Zero false "Synced" messages on network drops.
- **Result**: **PASS**

### Test 3: Light Mode Contrast & Visual Legibility
- **Step**: Toggle iOS system appearance from Dark to Light Mode.
- **Observed Result**:
  - Dashboard background renders clean `#F8FAFC`, cards render pure `#FFFFFF`.
  - Headers, step counters, and macro titles render deep `#0F172A` with contrast ratio **17.85:1 (AAA)**.
  - Acid green accents and status chips maintain crisp readability.
- **Result**: **PASS**

### Test 4: Subscription Timeline & Next Billing Date
- **Step**: Open Settings Drawer → Subscription Plans.
- **Observed Result**:
  - Active monthly subscribers explicitly see `Next billing date: <Date>`.
  - Cancelled subscribers in grace period explicitly see `Active until: <Date>`.
  - Free users see `Free Tier` without synthetic dates.
- **Result**: **PASS**

### Test 5: Responsive Layout on Narrow Screens
- **Step**: Open Health Hub Settings Modal and Connections Modal on 320px viewport.
- **Observed Result**:
  - Timeframe selector wraps cleanly into 2x2 grid.
  - Action buttons stack vertically without truncating labels or clipping borders.
  - Header actions wrap cleanly into second line without horizontal scrollbar.
- **Result**: **PASS**

---

## 3. Physical Release Sign-off

Calyxo 1.0 has met all physical UX synchronization, HealthKit privacy truthfulness, contrast accessibility, and responsive reliability standards.
