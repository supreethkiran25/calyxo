# CALYXO — NATIVE MIGRATION CONTRACT & FEATURE PARITY SPECIFICATION

**Platform**: Calyxo Health Operating System (`CALYXOAPP`)  
**Document Type**: Phase 3B — Forensic Architecture to File-Level Implementation Contract  
**Mode**: READ-ONLY Architectural Specification (Zero Application Code Alterations)  
**Target Quality**: Apple Health & Google Health Grade Native Engineering  
**Platforms Covered**: Web (React 19 / Vite), iOS (Swift / SwiftUI), watchOS, Android (Kotlin / Jetpack Compose), Wear OS  
**Date**: August 28, 2026  

---

## 1. Current Architecture Forensic Map

The Calyxo repository (`/Users/supreethk/Documents/calyxo/CALYXOAPP`) comprises the following structural components:

```text
CALYXOAPP ROOT DIRECTORY FORENSIC MAP
│
├── package.json                         // Root React 19 + Vite + Capacitor 8 dependencies
├── vite.config.mjs                      // Vite build bundler configuration
├── capacitor.config.json                // Capacitor runtime container configuration
├── index.html                           // PWA HTML viewport entry
├── CALYXO_MASTER_SUPABASE_SCHEMA.sql    // 503-line Master PostgreSQL schema (Tables, RLS, Indexes)
│
├── api/                                 // Serverless Edge Functions (Vercel)
│   ├── create-order.js                  // Authoritative Razorpay order creation
│   ├── verify-payment.js                // Cryptographic HMAC payment verification
│   └── gemini.js                        // Server-side Google Gemini 2.5 Pro inference proxy
│
├── src/                                 // Core Application Source Tree
│   ├── main.jsx                         // React 18/19 DOM Root Mount
│   ├── App.jsx                          // BrowserRouter Route Registry & Guard Pipelines
│   │
│   ├── components/                      // React UI Presentation & Adapter Layer
│   │   ├── NativeMobileBridge.jsx       // Capacitor Lifecycle, StatusBar, Deep-Links & Keyboard Glue
│   │   ├── UniversalLiveHUD.jsx         // Global Rest Timer Audio & Floating Overlay
│   │   ├── Dashboard.js                 // Main Quad Ring & Metric Card View
│   │   ├── WorkoutLogger.js             // Interactive Set-by-Set Strength Logger
│   │   ├── FoodTracker.js               // Food Logging, Indian Food DB Search & Macro Split
│   │   ├── UserProfile.js               // Athlete Biometrics, Targets & Settings
│   │   ├── OnboardingFlow.js            // 5-Step Intelligence Profile Builder
│   │   └── analytics/                   // SVG Anatomical Muscle Map Views
│   │
│   ├── pages/                           // Route Page Assemblies
│   │   ├── HomePage.jsx                 // Public SEO Landing Experience
│   │   ├── user/                        // Authenticated Athlete Views (Dashboard, Workout, Nutrition, etc.)
│   │   ├── website/                     // Public Brand Pages (Vision, Philosophy, Ecosystem, Legal)
│   │   └── admin/                       // Desktop Super-Admin Operating System (12 Sub-Views)
│   │
│   ├── services/                        // Application Domain Logic & Integrations
│   │   ├── health/                      // Deterministic Recovery, HealthDataService, Sleep Tracker
│   │   ├── analytics/                   // MuscleStimulusEngine (Taxonomy, Volume, 5-Tier Stimulus)
│   │   ├── notifications/               // SmartReminderEngine, CalyxoNotificationManager
│   │   ├── sync/                        // SyncEngine (Outbox Queue & Conflict Resolution Matrix)
│   │   ├── ai/                          // CalyxoAIOrchestrator, AIBriefingEngine, ChatSessionManager
│   │   └── subscription/                // SubscriptionManager (Entitlement State Machine)
│   │
│   ├── store/                           // Zustand Reactive Memory Stores
│   │   ├── useStore.js                  // Primary Athlete State Store (User, Logs, Preferences)
│   │   ├── useEcosystemStore.js         // Gamification, Streaks, XP & Leveling
│   │   └── useQuickActionsStore.js      // Deep-Link & Modal Workflow Triggers
│   │
│   ├── utils/                           // Algorithmic Utilities & Automated Test Suites
│   │   ├── macroCalculator.js           // Mifflin-St Jeor TDEE & Macro Calculations
│   │   ├── dateUtils.js                 // Timezone & Date Formatting Utilities
│   │   ├── muscleAnalyticsTestRunner.js // 35 Assertion Muscle Stimulus Test Suite
│   │   ├── smartReminderTestRunner.js   // 29 Assertion Notification Evaluation Test Suite
│   │   ├── syncConflictTestRunner.js    // 15 Assertion Event Sourcing Conflict Test Suite
│   │   ├── paymentProductionTestRunner.js// 39 Assertion Subscription Certification Suite
│   │   └── rc3MasterProductionTestRunner.js // 286 Assertion Production Master Suite
│   │
│   └── lib/                             // Data Client Adapters
│       ├── supabaseClient.js            // Supabase JS Client Instance
│       └── dbService.js                 // Supabase PostgREST Table CRUD & Pre-Auth State Migration
│
├── ios/                                 // Native iOS Xcode Workspace
│   └── App/
│       ├── App.xcodeproj                // Multi-Target Xcode Project (App, Widgets, Watch)
│       ├── App/                         // Main iOS Target (AppDelegate, Custom Swift Plugins)
│       ├── CalyxoWidgets/               // Native SwiftUI WidgetKit & ActivityKit Target
│       └── CalyxoWatch/                 // Standalone SwiftUI Apple Watch Target
│
├── android/                             // Native Android Studio Gradle Project
│   └── app/src/main/
│       ├── AndroidManifest.xml          // Permissions, Activity & Widget Declarations
│       └── java/com/calyxo/app/         // MainActivity, CalyxoHealthPlugin, AppWidgetProviders
│
├── calyxo-mobile/                       // Standalone React Native / Expo Prototype Directory
└── docs/                                // Enterprise Architecture & Forensic Verification Documents
```

---

## 2. Mobile Dependency Forensics

Every mobile-related JavaScript and React module in `src/` is audited against browser and native runtime bindings:

| Source Module | React Dep | DOM / Browser API | Local / Session Storage | Service Worker / PWA | Capacitor Plugin Dep | Forensic Classification | Evidence Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/services/health/DeterministicRecoveryEngine.js` | None | None | None | None | None | `PLATFORM-AGNOSTIC` | Pure mathematical function. Zero external imports. |
| `src/services/analytics/MuscleStimulusEngine.js` | None | None | None | None | None | `PLATFORM-AGNOSTIC` | Pure taxonomy dictionary and volume math. |
| `src/services/sync/SyncEngine.js` (ConflictResolver) | None | None | None | None | None | `PLATFORM-AGNOSTIC` | Functional object merging logic. |
| `src/services/sync/SyncEngine.js` (OutboxSyncManager)| None | None | `localStorage` | None | None | `MIXED` | Queue algorithms are pure; persistence uses `localStorage`. |
| `src/services/notifications/SmartReminderEngine.js` | None | `Intl.DateTimeFormat` | `localStorage` | None | None | `PLATFORM-AGNOSTIC` | Evaluates rule trees; timezone math uses standard ECMAScript. |
| `src/services/subscription/SubscriptionManager.js` | None | None | `localStorage` | None | `@capacitor/preferences` | `MIXED` | Entitlement rules are pure; preferences fallback exists. |
| `src/services/ai/AIBriefingEngine.js` | None | None | None | None | None | `PLATFORM-AGNOSTIC` | Synthesizes plain JS metric objects into grounded directives. |
| `src/services/ai/ChatSessionManager.js` | None | None | `localStorage` | None | None | `MIXED` | CRUD operations over `localStorage` JSON arrays. |
| `src/services/health/HealthDataService.js` | None | `window` | `HealthCache` | None | `CalyxoHealthKit`, `CalyxoHealthPlugin` | `CAPACITOR-COUPLED` | Calls Capacitor plugins across the bridge to query OS data. |
| `src/services/health/PhoneSleepTrackerService.js` | None | `visibilitychange`, `beforeunload`, `setInterval` | `localStorage` | None | `App.addListener` | `MIXED` | Emulates background sleep tracking via DOM lifecycle listeners. |
| `src/services/health/BluetoothHealthService.js` | None | `navigator.bluetooth` | None | None | `CalyxoBLEPlugin` | `CAPACITOR-COUPLED` | Bridges Web Bluetooth and native `CoreBluetooth`. |
| `src/services/notificationService.js` | None | `Notification`, `window` | `localStorage` | `navigator.serviceWorker` | `CalyxoNotification` | `CAPACITOR-COUPLED` | Dual pipeline: Web Push (VAPID) vs. Capacitor notification plugin. |
| `src/components/NativeMobileBridge.jsx` | React | `window`, `document`, `visualViewport` | `localStorage` | None | `@capacitor/*` | `CAPACITOR-COUPLED` | Bridge component binding Capacitor events to React state. |
| `src/components/UniversalLiveHUD.jsx` | React | `AudioContext`, `setInterval` | None | None | `@capacitor/haptics` | `MIXED` | Web Audio rest timer countdown overlay. |
| `src/components/WorkoutLogger.js` | React | DOM, Canvas | `localStorage` | None | `@capacitor/haptics` | `WEB-ONLY (UI)` | React DOM workout logger with Framer Motion animations. |
| `src/components/FoodTracker.js` | React | DOM, IndexedDB | `localStorage` | None | None | `WEB-ONLY (UI)` | React DOM food tracker with Recharts macro graphs. |
| `src/store/useStore.js` | Zustand | `window`, `beforeunload` | `localStorage` | None | None | `MIXED` | Reactive store holding user profile, logs, and theme state. |
| `ios/App/App/CalyxoHealthKitPlugin.swift` | None | None | None | None | Capacitor Plugin Subclass | `NATIVE-ALREADY` | Swift HealthKit queries (HKStatisticsQuery, CMPedometer). |
| `ios/App/CalyxoWidgets/CalyxoLiveActivity.swift` | None | None | App Group `UserDefaults` | None | None | `NATIVE-ALREADY` | Pure native SwiftUI Dynamic Island & Lock Screen widget. |
| `ios/App/CalyxoWidgets/CalyxoHomeWidgets.swift` | None | None | App Group `UserDefaults` | None | None | `NATIVE-ALREADY` | Pure native SwiftUI WidgetKit Home Screen widgets. |
| `android/app/src/main/java/com/calyxo/app/CalyxoHealthPlugin.java` | None | None | `SharedPreferences` | None | Capacitor Plugin Subclass | `NATIVE-ALREADY` | Android Java hardware step sensor listener. |

---

## 3. Exact File Migration Matrix

| Current Repository File | Current Responsibility | Platform Dependency | Migration Destination (iOS / Android) | Required Action | Risk Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/services/health/DeterministicRecoveryEngine.js` | 0–100 Recovery score math | `PLATFORM-AGNOSTIC` | iOS: `Domain/Engines/DeterministicRecoveryEngine.swift`<br>Android: `domain/engine/DeterministicRecoveryEngine.kt` | `REIMPLEMENT-BOTH` | `TRIVIAL` |
| `src/services/analytics/MuscleStimulusEngine.js` | Exercise taxonomy & volume math | `PLATFORM-AGNOSTIC` | iOS: `Domain/Engines/MuscleStimulusEngine.swift`<br>Android: `domain/engine/MuscleStimulusEngine.kt` | `REIMPLEMENT-BOTH` | `LOW` |
| `src/utils/macroCalculator.js` | BMR & TDEE macro targets | `PLATFORM-AGNOSTIC` | iOS: `Domain/Engines/MacroCalculator.swift`<br>Android: `domain/engine/MacroCalculator.kt` | `REIMPLEMENT-BOTH` | `TRIVIAL` |
| `src/services/sync/SyncEngine.js` | Conflict resolution & Outbox | `MIXED` | iOS: `Sync/SyncConflictMatrix.swift` & `OutboxManager.swift`<br>Android: `domain/sync/SyncConflictResolver.kt` & `SyncOutboxWorker.kt` | `REIMPLEMENT-BOTH` | `MEDIUM` |
| `src/services/notifications/SmartReminderEngine.js` | Reminder evaluation rules | `PLATFORM-AGNOSTIC` | iOS: `Notifications/NotificationScheduler.swift`<br>Android: `notifications/CalyxoNotificationManager.kt` | `REIMPLEMENT-BOTH` | `LOW` |
| `src/services/notifications/NotificationThemeLibrary.js`| Copy matrix & 30-day cooldown | `PLATFORM-AGNOSTIC` | iOS: `Domain/Models/NotificationThemeLibrary.swift`<br>Android: `domain/model/NotificationThemeLibrary.kt` | `REIMPLEMENT-BOTH` | `TRIVIAL` |
| `src/services/subscription/SubscriptionManager.js` | Subscription entitlement checks | `MIXED` | iOS: `Payments/StoreKitManager.swift`<br>Android: `billing/PlayBillingManager.kt` | `REIMPLEMENT-BOTH` | `MEDIUM` |
| `src/services/ai/AIBriefingEngine.js` | Grounded morning briefings | `PLATFORM-AGNOSTIC` | Backend Edge Function (`/api/ai/briefing`) | `EXTRACT` | `LOW` |
| `src/services/ai/ChatSessionManager.js` | AI chat session persistence | `MIXED` | iOS: `Features/AICoach/AICoachViewModel.swift` (SwiftData)<br>Android: `presentation/screens/aicoach/AICoachViewModel.kt` (Room) | `REIMPLEMENT-BOTH` | `LOW` |
| `src/services/health/HealthDataService.js` | Health metrics aggregation | `CAPACITOR-COUPLED` | iOS: `Health/HealthKitManager.swift`<br>Android: `health/HealthConnectManager.kt` | `REIMPLEMENT-BOTH` | `LOW` |
| `src/services/health/PhoneSleepTrackerService.js` | Phone inactivity sleep | `MIXED` | iOS: Native HealthKit sleep query<br>Android: `background/SleepInactivityWorker.kt` | `REIMPLEMENT-BOTH` | `MEDIUM` |
| `src/services/health/BluetoothHealthService.js` | BLE HR monitor connection | `CAPACITOR-COUPLED` | iOS: `Health/BluetoothManager.swift` (`CoreBluetooth`)<br>Android: `health/BleHeartRateManager.kt` (`BluetoothGatt`) | `REIMPLEMENT-BOTH` | `LOW` |
| `src/components/NativeMobileBridge.jsx` | Capacitor bridge coordinator | `CAPACITOR-COUPLED` | Replaced by native App lifecycle listeners | `RETIRE-LATER` | `NONE` |
| `src/components/UniversalLiveHUD.jsx` | Floating rest timer overlay | `MIXED` | iOS: `LiveActivities/CalyxoLiveActivityController.swift`<br>Android: Foreground Service Notification | `REIMPLEMENT-BOTH` | `LOW` |
| `src/pages/user/DashboardPage.jsx` | Mobile dashboard layout | `WEB-ONLY (UI)` | iOS: `Features/Dashboard/Views/DashboardView.swift`<br>Android: `presentation/screens/dashboard/DashboardScreen.kt` | `REIMPLEMENT-BOTH` | `HIGH` |
| `src/components/WorkoutLogger.js` | Set-by-set workout logger | `WEB-ONLY (UI)` | iOS: `Features/Workout/Views/ActiveSessionView.swift`<br>Android: `presentation/screens/workout/ActiveSessionScreen.kt` | `REIMPLEMENT-BOTH` | `HIGH` |
| `src/components/FoodTracker.js` | Nutrition & meal tracker | `WEB-ONLY (UI)` | iOS: `Features/Nutrition/Views/NutritionView.swift`<br>Android: `presentation/screens/nutrition/NutritionScreen.kt` | `REIMPLEMENT-BOTH` | `MEDIUM` |
| `src/pages/user/HealthPage.jsx` | Health hub telemetry graphs | `WEB-ONLY (UI)` | iOS: `Features/Health/Views/HealthHubView.swift`<br>Android: `presentation/screens/health/HealthHubScreen.kt` | `REIMPLEMENT-BOTH` | `MEDIUM` |
| `src/components/UserProfile.js` | Profile & target customizer | `WEB-ONLY (UI)` | iOS: `Features/Profile/Views/ProfileView.swift`<br>Android: `presentation/screens/profile/ProfileScreen.kt` | `REIMPLEMENT-BOTH` | `LOW` |
| `src/lib/supabaseClient.js` | Supabase client initialization | `PLATFORM-AGNOSTIC` | iOS: `Domain/Network/SupabaseClient.swift` (`supabase-swift`)<br>Android: `di/AppModule.kt` (`supabase-kt`) | `REIMPLEMENT-BOTH` | `LOW` |
| `src/lib/dbService.js` | Supabase CRUD & pre-auth sync | `MIXED` | iOS: `Data/Repositories/`<br>Android: `data/repository/` | `REIMPLEMENT-BOTH` | `LOW` |
| `ios/App/App/AppDelegate.swift` | iOS App Delegate | `NATIVE-ALREADY` | iOS: `ios/CalyxoApp.swift` & `AppDelegate.swift` | `PRESERVE` | `LOW` |
| `ios/App/App/CalyxoHealthKitPlugin.swift`| Native Swift HealthKit plugin | `NATIVE-ALREADY` | iOS: `Health/HealthKitManager.swift` (strip bridge) | `EXTRACT` | `LOW` |
| `ios/App/CalyxoWidgets/CalyxoLiveActivity.swift`| SwiftUI Dynamic Island | `NATIVE-ALREADY` | iOS: `CalyxoWidgetsExtension/CalyxoLiveActivityView.swift` | `PRESERVE` | `TRIVIAL` |
| `ios/App/CalyxoWidgets/CalyxoHomeWidgets.swift`| SwiftUI WidgetKit Widgets | `NATIVE-ALREADY` | iOS: `CalyxoWidgetsExtension/CalyxoHomeWidgets.swift` | `PRESERVE` | `TRIVIAL` |
| `android/app/src/main/java/com/calyxo/app/CalyxoHealthPlugin.java`| Android SensorManager plugin | `NATIVE-ALREADY` | Android: Replaced by Health Connect Client | `REIMPLEMENT-ANDROID` | `MEDIUM` |
| `src/pages/HomePage.jsx` | Public SEO website homepage | `WEB-ONLY` | Public Web (Vercel / React 19) | `DO-NOT-TOUCH` | `NONE` |
| `src/pages/admin/*` (12 files) | Super-Admin operations console | `WEB-ONLY` | Desktop Web (Vercel / React 19) | `DO-NOT-TOUCH` | `NONE` |
| `api/create-order.js` | Serverless Razorpay order gen | `WEB-ONLY (API)` | Serverless Backend (Vercel) | `DO-NOT-TOUCH` | `NONE` |
| `api/verify-payment.js` | Serverless HMAC verification | `WEB-ONLY (API)` | Serverless Backend (Vercel) | `DO-NOT-TOUCH` | `NONE` |
| `api/gemini.js` | Serverless Gemini AI gateway | `PLATFORM-AGNOSTIC` | Serverless Backend (Vercel) | `DO-NOT-TOUCH` | `NONE` |

---

## 4. React → iOS Screen Mapping

| Current React Screen | Current Web Route | iOS SwiftUI Destination | Native Navigation Structure | Dependencies / Models | Complexity | Parity Requirements |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `UserDashboardPage` | `/user/dashboard` | `Features/Dashboard/Views/DashboardView.swift` | `NavigationStack` Root Tab 1 | `User`, `Workout`, `RecoveryScore`, `QuadRings` | `HIGH` | 4-layer concentric progress rings, recovery readiness badge, quick action shortcuts. |
| `UserWorkoutPage` | `/user/workout` | `Features/Workout/Views/WorkoutHubView.swift` | `NavigationStack` Root Tab 2 | `Workout`, `Exercise`, `MuscleStimulus` | `HIGH` | Exercise routine list, muscle volume breakdown, history log list. |
| `WorkoutLogger` (Modal) | Active Session | `Features/Workout/Views/ActiveSessionView.swift` | Full-screen Modal / Sheet | `WorkoutSession`, `RestTimer`, `ActivityKit` | `HIGH` | Set stepper wheels, RPE rating, dynamic rest interval HUD in Dynamic Island. |
| `UserNutritionPage` | `/user/nutrition` | `Features/Nutrition/Views/NutritionView.swift` | `NavigationStack` Root Tab 3 | `Meal`, `FoodItem`, `MacroTargets` | `MEDIUM` | Macro split ring (Carbs/Protein/Fat), meal category lists (Breakfast, Lunch, Dinner, Snacks). |
| `FoodTracker` (Modal) | Add Food Modal | `Features/Nutrition/Views/FoodSearchView.swift` | Navigation Sheet with Search Bar | SQLite Food Database, `Meal` | `MEDIUM` | Real-time Indian food DB search, custom gram weight picker, macro sum preview. |
| `UserHealthPage` | `/user/health` | `Features/Health/Views/HealthHubView.swift` | `NavigationStack` Root Tab 4 | `HealthKitManager`, `RecoveryScore` | `HIGH` | Sleep quality stage chart, resting HR trend, VO2 max, BLE heart rate status badge. |
| `UserAIPage` | `/user/ai` | `Features/AICoach/Views/AICoachView.swift` | `NavigationStack` Root Tab 5 | `AICoachViewModel`, `/api/ai/chat` | `MEDIUM` | Streaming Markdown bubble chat, quick prompt chips, grounded daily briefing card. |
| `UserProfilePage` | `/user/profile` | `Features/Profile/Views/ProfileView.swift` | `NavigationStack` Profile Route | `UserProfile`, `SubscriptionManager` | `LOW` | Athlete weight, height, age, activity level steppers, goal selector, subscription paywall. |
| `UserProgressPage` | `/user/progress` | `Features/Profile/Views/ProgressView.swift` | Navigation Link | `WeightLog`, `WorkoutLog`, Charts | `MEDIUM` | Weight history line graph, volume progression chart, monthly adherence heatmap. |
| `UserChallengesPage` | `/user/challenges` | `Features/Profile/Views/ChallengesView.swift`| Navigation Link | `EcosystemState`, `ChallengeEvent` | `LOW` | Streak status counter, level progression bar, daily quest completion checkboxes. |
| `SettingsDrawerPanel` | Settings Drawer | `Features/Profile/Views/SettingsView.swift` | Navigation Sheet | `UserSettings`, `NotificationPrefs` | `LOW` | Notification category toggles, unit selector (kg/lbs), theme preference, account deletion. |
| `SupportPage` | `/user/support` | `Features/Profile/Views/SupportView.swift` | Navigation Link | `MFMailComposeViewController` | `TRIVIAL` | FAQ accordion list, direct support email trigger to `support@calyxo.app`. |
| `PrivacyPage` | `/user/privacy` | `Features/Profile/Views/PrivacyLegalView.swift`| Navigation Link | Static Markdown Text | `TRIVIAL` | In-app privacy policy viewer with clean native typography. |
| `TermsPage` | `/user/terms` | `Features/Profile/Views/TermsLegalView.swift` | Navigation Link | Static Markdown Text | `TRIVIAL` | Terms of service text viewer. |
| `AccessibilityPage` | `/user/accessibility`| `Features/Profile/Views/AccessibilityLegalView.swift`| Navigation Link | Static Markdown Text | `TRIVIAL` | Accessibility commitment statement. |
| `OnboardingFlow` | `/welcome` | `Features/Auth/Views/OnboardingFlowView.swift` | Navigation Flow (5 Steps) | `HealthKitManager`, `UserProfile` | `MEDIUM` | Goal selection, biometric entry, Apple Health permission prompt, initial plan generation. |

---

## 5. React → Android Screen Mapping

| Current React Screen | Current Web Route | Android Jetpack Compose Destination | Compose Navigation Route | Dependencies / Models | Complexity | Parity Requirements |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `UserDashboardPage` | `/user/dashboard` | `presentation/screens/dashboard/DashboardScreen.kt` | `Screen.Dashboard` | `DashboardViewModel`, `Room` | `HIGH` | Concentric quad progress rings, readiness badge, quick log buttons. |
| `UserWorkoutPage` | `/user/workout` | `presentation/screens/workout/WorkoutHubScreen.kt` | `Screen.Workout` | `WorkoutViewModel`, `Room` | `HIGH` | Routine list, anatomical muscle highlight map, training volume stats. |
| `WorkoutLogger` (Modal) | Active Session | `presentation/screens/workout/ActiveSessionScreen.kt` | `Screen.ActiveWorkout` | `ActiveWorkoutViewModel`, Foreground Svc | `HIGH` | Set weight/reps pickers, rest timer overlay, media-style notification. |
| `UserNutritionPage` | `/user/nutrition` | `presentation/screens/nutrition/NutritionScreen.kt` | `Screen.Nutrition` | `NutritionViewModel`, `Room` | `MEDIUM` | Macro ring breakdown, categorized meal lists, daily water intake card. |
| `FoodTracker` (Modal) | Add Food Modal | `presentation/screens/nutrition/FoodSearchScreen.kt` | `Screen.FoodSearch` | SQLite FTS5 Food DB, `Meal` | `MEDIUM` | Search bar with instantaneous filtering, gram weight stepper, macro preview. |
| `UserHealthPage` | `/user/health` | `presentation/screens/health/HealthHubScreen.kt` | `Screen.Health` | `HealthConnectManager`, `Room` | `HIGH` | Sleep duration trend, heart rate chart, BLE connection status card. |
| `UserAIPage` | `/user/ai` | `presentation/screens/aicoach/AICoachScreen.kt` | `Screen.AICoach` | `AICoachViewModel`, `/api/ai/chat` | `MEDIUM` | Streaming markdown message list, prompt chips, grounded morning briefing card. |
| `UserProfilePage` | `/user/profile` | `presentation/screens/profile/ProfileScreen.kt` | `Screen.Profile` | `ProfileViewModel`, `PlayBilling` | `LOW` | Biometric parameter editors, daily calorie goals, subscription tier manager. |
| `UserProgressPage` | `/user/progress` | `presentation/screens/profile/ProgressScreen.kt` | `Screen.Progress` | `WeightDao`, `WorkoutDao` | `MEDIUM` | Weight chart, weekly tonnage progression, streak adherence calendar. |
| `UserChallengesPage` | `/user/challenges` | `presentation/screens/profile/ChallengesScreen.kt`| `Screen.Challenges` | `EcosystemState` | `LOW` | Streak badges, XP level progress bar, challenge event cards. |
| `SettingsDrawerPanel` | Settings Drawer | `presentation/screens/profile/SettingsScreen.kt` | `Screen.Settings` | `DataStore` | `LOW` | Notification channel preferences, measurement units, account logout/deletion. |
| `SupportPage` | `/user/support` | `presentation/screens/profile/SupportScreen.kt` | `Screen.Support` | Intent (`ACTION_SENDTO`) | `TRIVIAL` | FAQ expandable cards, direct email intent to `support@calyxo.app`. |
| `PrivacyPage` | `/user/privacy` | `presentation/screens/profile/PrivacyScreen.kt` | `Screen.Privacy` | Static Markdown Text | `TRIVIAL` | In-app legal text viewer. |
| `TermsPage` | `/user/terms` | `presentation/screens/profile/TermsScreen.kt` | `Screen.Terms` | Static Markdown Text | `TRIVIAL` | In-app legal text viewer. |
| `AccessibilityPage` | `/user/accessibility`| `presentation/screens/profile/AccessibilityScreen.kt`| `Screen.Accessibility`| Static Markdown Text | `TRIVIAL` | TalkBack optimized accessibility statement. |
| `OnboardingFlow` | `/welcome` | `presentation/screens/auth/OnboardingScreen.kt` | `Screen.Onboarding` | `HealthConnectManager` | `MEDIUM` | 5-step pager for fitness goals, biometrics, Health Connect consent, and calorie baseline. |

---

## 6. Business Logic Extraction Audit

| Service / Engine | Pure Business Logic | UI Framework Coupling | Storage Layer Coupling | Native Platform Coupling | iOS Extraction Strategy | Android Extraction Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DeterministicRecoveryEngine` | 0–100 recovery score math, readiness tiers, penalty points | None | None | None | Port 1:1 to Swift struct with pure functions | Port 1:1 to Kotlin object with pure functions |
| `MuscleStimulusEngine` | 50+ exercise taxonomy, volume calculations, 5-tier stimulus | None | None | None | Port 1:1 to Swift struct + enum taxonomy | Port 1:1 to Kotlin object + sealed class taxonomy |
| `macroCalculator` | Mifflin-St Jeor BMR, TDEE multiplier, macro targets | None | None | None | Port 1:1 to Swift utility | Port 1:1 to Kotlin utility |
| `SyncEngine` (ConflictResolver) | Workout union merge, additive water merge, LWW settings | None | None | None | Port 1:1 to Swift `SyncConflictMatrix` | Port 1:1 to Kotlin `SyncConflictResolver` |
| `OutboxSyncManager` | Queue enqueue, dedupeKey check, retry backoff | None | `localStorage` | None | SwiftData `SyncEvent` entity with async flush | Room `SyncEventEntity` with `WorkManager` |
| `SmartReminderEngine` | 1 PM lunch rule, 8 PM workout rule, quiet hours check | None | `localStorage` | `Intl` Timezone | Port rules to Swift `NotificationScheduler` | Port rules to Kotlin `ReminderScheduler` |
| `NotificationThemeLibrary` | Copy matrix, Zomato-style humor, 30-day cooldown filter | None | None | None | Port dictionary to Swift static catalog | Port dictionary to Kotlin static catalog |
| `SubscriptionManager` | Free/High/Admin/Trainer state machine, feature gating | None | `localStorage` | `@capacitor/preferences` | Port to Swift `StoreKitManager` | Port to Kotlin `PlayBillingManager` |
| `DataFreshnessHelper` | LIVE (<30s), RECENT (<10m), STALE (<24h), UNAVAILABLE | None | None | None | Port 1:1 to Swift timestamp extension | Port 1:1 to Kotlin timestamp extension |
| `PhoneSleepTrackerService` | Nighttime inactivity window calculation (3.5h–14h) | None | `localStorage` | `App.addListener`, DOM | Replace with HealthKit `.sleepAnalysis` | Replace with Health Connect `SleepSessionRecord` |
| `CalyxoAIOrchestrator` | Intent classification, medical red flag filter | None | None | None | Retain on Serverless Edge (`/api/ai/*`) | Retain on Serverless Edge (`/api/ai/*`) |

---

## 7. Canonical Domain Logic Contracts & Empirical Test Vectors

### Contract 1: Deterministic Recovery Engine
- **Implementation**: [DeterministicRecoveryEngine.js](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/src/services/health/DeterministicRecoveryEngine.js)
- **Mathematical Formula**:
  $$\text{Base Score} = 50$$
  $$\text{Sleep Points} = \min\left(25, \text{round}\left(\min\left(1.25, \frac{\text{sleepHours}}{8.0}\right) \times 25\right)\right)$$
  $$\text{Hydration Points} = \min\left(15, \text{round}\left(\min\left(1.0, \frac{\text{waterMl}}{\text{waterGoalMl}}\right) \times 15\right)\right)$$
  $$\text{Protein Points} = \min\left(10, \text{round}\left(\min\left(1.0, \frac{\text{proteinGrams}}{\text{proteinGoalGrams}}\right) \times 10\right)\right)$$
  $$\text{Penalties} = \text{Fatigue Penalty} + \text{Soreness Penalty} + \text{RHR Delta Penalty} + \text{Excess Calorie Penalty}$$
  $$\text{Final Score} = \max\left(0, \min\left(100, \text{Base} + \text{Sleep} + \text{Hydration} + \text{Protein} - \text{Penalties}\right)\right)$$

#### Canonical Test Vectors (from Repository Test Suites):
```text
VECTOR 1: Empty / Zero Input State
INPUT: { sleepHours: 0, waterMl: 0, proteinGrams: 0, hasLoggedWorkoutToday: false, restingHR: 0, activeCaloriesBurned: 0 }
EXPECTED OUTPUT: { available: false, score: null, readiness: 'UNAVAILABLE' }
EVIDENCE: DeterministicRecoveryEngine.js (Line 41)

VECTOR 2: Perfect Adherence Recovery State
INPUT: { sleepHours: 8.0, waterMl: 3000, waterGoalMl: 3000, proteinGrams: 150, proteinGoalGrams: 150, fatigue: 1, soreness: 1, restingHR: 60 }
EXPECTED OUTPUT: { available: true, score: 100, readiness: 'OPTIMAL' }

VECTOR 3: High Fatigue & Severe Soreness Penalty
INPUT: { sleepHours: 6.0, waterMl: 1500, waterGoalMl: 3000, proteinGrams: 75, proteinGoalGrams: 150, fatigue: 9, soreness: 9, hasLoggedWorkoutToday: true }
EXPECTED OUTPUT: { available: true, score: <= 45, readiness: 'RECOVERY NEEDED' }
```

---

### Contract 2: Muscle Stimulus & Anatomical Engine
- **Implementation**: [MuscleStimulusEngine.js](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/src/services/analytics/MuscleStimulusEngine.js)
- **Tonnage Formula**: $\text{Tonnage} = \text{Weight (kg)} \times \text{Reps}$
- **Stimulus Tiers**: Level 0 (`NONE`: 0), Level 1 (`LIGHT`: 1–34), Level 2 (`MODERATE`: 35–69), Level 3 (`HIGH`: 70–109), Level 4 (`VERY HIGH`: $\ge 110$).

#### Canonical Test Vectors (from `src/utils/muscleAnalyticsTestRunner.js`):
```text
VECTOR 1: Chest Workout Stimulus Distribution
INPUT WORKOUT: [
  { name: 'Bench Press', sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 10 }, { weight: 60, reps: 10 }] }, // 1800 kg
  { name: 'Incline Dumbbell Press', sets: [{ weight: 20, reps: 10 }, { weight: 20, reps: 10 }, { weight: 20, reps: 10 }] }, // 600 kg
  { name: 'Cable Fly', sets: [{ weight: 15, reps: 12 }, { weight: 15, reps: 12 }, { weight: 15, reps: 12 }] } // 540 kg
]
EXPECTED OUTPUT:
  totalVolumeKg: 2940
  totalExercises: 3
  muscleDetails.chest.stimulusLevel.level: >= 3 (High / Very High)
  muscleDetails.triceps.stimulusLevel.level: >= 1 (Secondary Stimulus)
  muscleDetails.frontDeltoid.stimulusLevel.level: >= 1 (Secondary Stimulus)
  muscleDetails.quadriceps.stimulusLevel.level: 0 (Zero Stimulus)
EVIDENCE: muscleAnalyticsTestRunner.js (Lines 89-108)
```

---

### Contract 3: Event Sourcing & Offline Conflict Resolution
- **Implementation**: [SyncEngine.js](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/src/services/sync/SyncEngine.js)

#### Canonical Test Vectors (from `src/utils/syncConflictTestRunner.js`):
```text
VECTOR 1: Workout Set Union Merge
LOCAL:   [ { id: 'set_1', weight: 80, reps: 10, completed: true }, { id: 'set_2', weight: 80, reps: 8, completed: false } ]
INCOMING: [ { id: 'set_1', weight: 80, reps: 10, completed: true }, { id: 'set_2', weight: 85, reps: 8, completed: true }, { id: 'set_3', weight: 90, reps: 5, completed: true } ]
EXPECTED RESOLVED: [
  { id: 'set_1', weight: 80, reps: 10, completed: true },
  { id: 'set_2', weight: 85, reps: 8, completed: true }, // Highest completed load preserved
  { id: 'set_3', weight: 90, reps: 5, completed: true }  // Missing set appended
]
EVIDENCE: syncConflictTestRunner.js (Lines 57-78)

VECTOR 2: Hydration Event Additive Deduplication
LOCAL:   [ { id: 'h1', timestamp: 1000, amount: 250 }, { id: 'h2', timestamp: 2000, amount: 500 } ]
INCOMING: [ { id: 'h2', timestamp: 2000, amount: 500 }, { id: 'h3', timestamp: 3000, amount: 250 } ]
EXPECTED RESOLVED: [
  { id: 'h1', timestamp: 1000, amount: 250 },
  { id: 'h2', timestamp: 2000, amount: 500 },
  { id: 'h3', timestamp: 3000, amount: 250 }
] // Total = 1000ml (Zero duplicate addition of h2)
EVIDENCE: syncConflictTestRunner.js (Lines 80-105)
```

---

## 8. Data Contract & Schema Mapping

| Domain Entity | Supabase Table / API | Primary Key | iOS Swift Model | Android Kotlin Model | Sync Direction | Master Ownership |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UserProfile** | `public.user_profiles` | `id: UUID` | `struct UserProfile: Codable, Identifiable` | `data class UserProfile(...)` | Bi-directional (LWW) | Cloud Authoritative |
| **UserTelemetry**| `public.users_metrics` | `id: String` | `struct UserMetrics: Codable` | `data class UserMetrics(...)` | Bi-directional (LWW) | Cloud Authoritative |
| **WorkoutLog** | `public.workout_logs` | `id: UUID` | `struct WorkoutLog: Codable, Identifiable` | `data class WorkoutLog(...)` | Bi-directional (Union) | Client Outbox Authoritative |
| **FoodLog** | `public.food_logs` | `id: UUID` | `struct FoodLog: Codable, Identifiable` | `data class FoodLog(...)` | Bi-directional (Additive) | Client Outbox Authoritative |
| **WeightLog** | `public.weight_logs` | `id: UUID` | `struct WeightLog: Codable, Identifiable` | `data class WeightLog(...)` | Bi-directional (Additive) | Client Outbox Authoritative |
| **HealthMetric** | `public.health_metrics`| `id: UUID` | `struct HealthMetric: Codable` | `data class HealthMetric(...)` | Device -> Cloud | OS Health Store Authoritative |
| **Subscription** | `public.subscriptions` | `user_id: UUID` | `struct Subscription: Codable` | `data class Subscription(...)` | Cloud -> Device | Server Authoritative |
| **AIConversation**| `public.ai_conversations`| `id: UUID`| `struct AIConversation: Codable` | `data class AIConversation(...)` | Bi-directional | Server Authoritative |
| **EcosystemState**| `public.ecosystem_state`| `user_id: UUID`| `struct EcosystemState: Codable` | `data class EcosystemState(...)` | Bi-directional (Merge) | Server Authoritative |
| **PushSubscription**| `public.push_subscriptions`| `id: UUID`| `struct PushDeviceToken: Codable` | `data class PushDeviceToken(...)`| Device -> Cloud | Device Token Authoritative |

---

## 9. Data Continuity Contract for Existing Users

```
Existing Web/PWA User (Email: athlete@calyxo.app)
                     │
                     ▼
      1. Logs in via Native iOS / Android App (GoTrue Auth)
                     │
                     ▼
      2. Server returns identical JWT Auth Token & UUID (`auth.users.id`)
                     │
                     ▼
      3. Native Client executes parallel initial hydration queries:
         ├── SELECT * FROM user_profiles WHERE id = :userId
         ├── SELECT * FROM workout_logs WHERE "userId" = :userId ORDER BY timestamp DESC LIMIT 50
         ├── SELECT * FROM food_logs WHERE "userId" = :userId ORDER BY timestamp DESC LIMIT 50
         ├── SELECT * FROM weight_logs WHERE "userId" = :userId ORDER BY timestamp DESC
         ├── SELECT * FROM subscriptions WHERE user_id = :userId
         └── SELECT * FROM ecosystem_state WHERE user_id = :userId
                     │
                     ▼
      4. Native SQLite / SwiftData / Room Database populated synchronously
                     │
                     ▼
      5. Native Dashboard Renders:
         ├── Exact current streak & level (Zero XP lost)
         ├── Exact workout volume history (All previous PRs preserved)
         ├── Active Pro subscription entitlement active immediately
         └── Historical weight graph rendered with 100% data fidelity
```

**Verification Proof**:
- `user_profiles.id` foreign key references `auth.users(id)` with `ON DELETE CASCADE`.
- Row Level Security (RLS) policies evaluate `auth.uid() = id` identically for web tokens and native tokens.
- **Zero data migration or schema mutation is required for existing users.**

---

## 10. Authentication Migration Contract

| Auth Flow | Current Hybrid Mechanism | Native iOS Implementation | Native Android Implementation | Backend API |
| :--- | :--- | :--- | :--- | :--- |
| **Email & Password** | `supabase.auth.signInWithPassword()` | `supabase.auth.signInWithPassword(email:password:)` | `supabase.auth.signInWith(Password) { ... }` | Supabase GoTrue `/auth/v1/token` |
| **Sign in with Apple** | In-App Browser redirect OAuth | Native `AuthenticationServices` (`ASAuthorizationAppleIDButton`) | Native Web OAuth Fallback / Credential Manager | GoTrue Apple Provider Token |
| **Sign in with Google** | In-App Browser redirect OAuth | Native `GoogleSignIn` SDK -> `signInWithIdToken` | Native `Google Credential Manager` -> `signInWithIdToken` | GoTrue Google Provider Token |
| **Password Reset** | `supabase.auth.resetPasswordForEmail()` | `supabase.auth.resetPasswordForEmail(email:)` | `supabase.auth.resetPasswordForEmail(email)` | GoTrue `/auth/v1/recover` |
| **Session Refresh** | JS Auto-Refresh Timer in LocalStorage | Native Background Auto-Refresh via `supabase-swift` | Native Background Auto-Refresh via `supabase-kt` | GoTrue `/auth/v1/token?grant_type=refresh_token` |
| **Secure Token Storage** | Browser `localStorage` (Plain Text) | **Apple Keychain** (`kSecClassGenericPassword`) | **EncryptedSharedPreferences** (Hardware Keystore) | Local OS Hardware Key |
| **Biometric Quick Unlock**| Not Supported | `LocalAuthentication` (`LAContext` Face ID / Touch ID) | `BiometricPrompt` (Class 3 Strong Biometrics) | Local Device Secure Enclave |

---

## 11. HealthKit Migration Contract (iOS)

- **Source Reference**: [CalyxoHealthKitPlugin.swift](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/ios/App/App/CalyxoHealthKitPlugin.swift)
- **Target Location**: `ios/App/App/Health/HealthKitManager.swift`

| Health Metric | HealthKit Identifier | Native Query Type | Background Delivery Frequency | Freshness State Rule | Fallback Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Steps** | `HKQuantityTypeIdentifier.stepCount` | `HKStatisticsQuery` (Cumulative Sum) | `.immediate` via `HKObserverQuery` | `LIVE` (< 1m) | `CMPedometer` Live Step Count |
| **Distance** | `HKQuantityTypeIdentifier.distanceWalkingRunning` | `HKStatisticsQuery` (Cumulative Sum) | `.hourly` | `RECENT` (< 10m) | Steps $\times 0.00075\text{ km}$ |
| **Active Calories**| `HKQuantityTypeIdentifier.activeEnergyBurned` | `HKStatisticsQuery` (Cumulative Sum) | `.immediate` via `HKObserverQuery` | `LIVE` (< 1m) | Steps $\times 0.042\text{ kcal}$ |
| **Heart Rate** | `HKQuantityTypeIdentifier.heartRate` | `HKSampleQuery` (Latest Sample) | Active Workout Only | `LIVE` (< 30s) | BLE Chest Strap GATT Stream |
| **Resting HR** | `HKQuantityTypeIdentifier.restingHeartRate` | `HKSampleQuery` (Daily Sample) | `.daily` | `RECENT` (< 24h) | Zero Initialized (0 BPM) |
| **HRV (SDNN)** | `HKQuantityTypeIdentifier.heartRateVariabilitySDNN` | `HKSampleQuery` (Latest Sample) | `.hourly` | `RECENT` (< 24h) | Zero Initialized (0 ms) |
| **Sleep Intervals**| `HKCategoryTypeIdentifier.sleepAnalysis` | `HKSampleQuery` (Asleep Stages) | `.hourly` upon waking | `RECENT` (< 24h) | Inactivity Sleep Scorer |
| **Body Mass** | `HKQuantityTypeIdentifier.bodyMass` | `HKSampleQuery` (Latest Sample) | On update | `STALE` (> 24h) | Manual Weight Log Entry |
| **VO2 Max** | `HKQuantityTypeIdentifier.vo2Max` | `HKSampleQuery` (Latest Sample) | On update | `STALE` (> 24h) | Zero Initialized (0.0) |

---

## 12. Health Connect Migration Contract (Android)

- **Target Location**: `android/app/src/main/java/com/calyxo/app/health/HealthConnectManager.kt`
- **Dependencies**: `androidx.health.connect:connect-client:1.1.0-alpha10`

| Health Metric | Health Connect Record Class | Access Permission | Aggregation Type | Availability Check |
| :--- | :--- | :--- | :--- | :--- |
| **Steps** | `StepsRecord` | `READ_STEPS` | `TOTAL_STEPS` (Aggregate) | `HealthConnectClient.getSdkStatus()` |
| **Distance** | `DistanceRecord` | `READ_DISTANCE` | `TOTAL_DISTANCE` (Aggregate) | `HealthConnectClient.getSdkStatus()` |
| **Active Calories**| `ActiveCaloriesBurnedRecord` | `READ_ACTIVE_CALORIES_BURNED` | `TOTAL_ENERGY` (Aggregate) | `HealthConnectClient.getSdkStatus()` |
| **Heart Rate** | `HeartRateRecord` | `READ_HEART_RATE` | `BPM_AVG` / Series | `HealthConnectClient.getSdkStatus()` |
| **Resting HR** | `RestingHeartRateRecord` | `READ_RESTING_HEART_RATE` | Latest Reading | `HealthConnectClient.getSdkStatus()` |
| **Sleep Session** | `SleepSessionRecord` | `READ_SLEEP` | Sleep Stage Durations | `HealthConnectClient.getSdkStatus()` |
| **Weight** | `WeightRecord` | `READ_WEIGHT` | Latest Reading | `HealthConnectClient.getSdkStatus()` |
| **Exercise Session**| `ExerciseSessionRecord` | `READ_EXERCISE` | Session List | `HealthConnectClient.getSdkStatus()` |

**Fallback Chain for Android**: If `HealthConnectClient.getSdkStatus()` returns `SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED` or `SDK_UNAVAILABLE`, the Android client falls back to:
1. Google Fit API (if present on device).
2. Hardware `SensorManager` (`Sensor.TYPE_STEP_COUNTER`).
3. Manual in-app activity logging.

---

## 13. Bluetooth Low Energy (BLE) Migration Contract

- **Source Reference**: [CalyxoBLEPlugin.swift](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/ios/App/App/CalyxoBLEPlugin.swift)
- **Target iOS**: `ios/App/App/Health/BluetoothManager.swift` (`CoreBluetooth`)
- **Target Android**: `android/app/src/main/java/com/calyxo/app/health/BleHeartRateManager.kt` (`BluetoothGatt`)

### Lifecycle State Machine:
```
[SCANNING] ──► [DISCOVERED] ──► [CONNECTING] ──► [CONNECTED / STREAMING]
     ▲                                                   │
     │                                                   ▼
     └───────────────── [RECONNECTING] ◄────────── [DISCONNECTED]
```

### GATT Characteristic Parser Specification:
```text
Service UUID: 0x180D (Heart Rate Service)
Characteristic UUID: 0x2A37 (Heart Rate Measurement)

BYTE 0 (Flags):
- Bit 0: 0 = UINT8 BPM format, 1 = UINT16 BPM format
- Bit 1-2: Sensor Contact Status (00/01 = Not Supported, 10 = Contact Not Detected, 11 = Contact Detected)
- Bit 3: Energy Expended Present (0 = False, 1 = True)
- Bit 4: RR-Intervals Present (0 = False, 1 = True)

RR-Interval Decoding:
- If Bit 4 == 1: RR values follow as 16-bit unsigned integers (units: 1/1024 seconds).
- HRV Calculation: SDNN = Standard deviation of valid RR intervals over a 60-second rolling window.
```

**Zero-Fake Hardening**: Upon `centralManager(_:didDisconnectPeripheral:error:)` or `onConnectionStateChange(GATT_DISCONNECTED)`, the active HR publisher **immediately emits `nil` / `null` with state `DISCONNECTED`**. Zero synthetic BPM is ever injected.

---

## 14. Notification Migration Contract

| Notification Type | Current Web / Capacitor Mechanism | Native iOS Implementation | Native Android Implementation | Deep-Link Routing Target |
| :--- | :--- | :--- | :--- | :--- |
| **Rest Timer Complete** | Web Audio + Timeout in WebView | `UNTimeIntervalNotificationTrigger` + Dynamic Island HUD | `NotificationCompat.Builder` (High Priority Channel) | Focus Active Workout Sheet |
| **1 PM Lunch Prompt** | PWA Service Worker Push | `UNCalendarNotificationTrigger` (13:00 Local) | `WorkManager` Exact Alarm (13:00 Local) | Open `/user/nutrition` Add Meal |
| **8 PM Workout Reminder** | PWA Service Worker Push | `UNCalendarNotificationTrigger` (20:00 Local) | `WorkManager` Exact Alarm (20:00 Local) | Open `/user/workout` Hub |
| **Hydration Milestone** | Local Notification Plugin | `UNCalendarNotificationTrigger` (Interval) | `WorkManager` Periodic Trigger | Open `/user/nutrition` Add Water |
| **Quick Action: +250ml** | Notification Action Tap | `UNNotificationAction("LOG_WATER_250")` -> App Group Sync | `NotificationCompat.Action` -> Background Intent | Background Sync (No UI Mount) |
| **Remote Broadcast Push** | Web Push (VAPID Keys) | Apple Push Notification service (APNs) | Firebase Cloud Messaging (FCM) | Dynamic Deep Link Payload |

---

## 15. Background Execution Migration Contract

| Current Mechanism | Limitation in Current Architecture | Native iOS Replacement | Native Android Replacement | Risk Classification |
| :--- | :--- | :--- | :--- | :--- |
| `setInterval` Heartbeat | Throttled to 1 tick/min or killed when screen locks | `BGAppRefreshTaskRequest` (`BGTaskScheduler`) | `PeriodicWorkRequest` (`WorkManager`) | `HIGH` (Must not rely on intervals) |
| `document.visibilitychange`| Only fires while WebView DOM context is loaded | `scenePhase` / `didEnterBackgroundNotification` | `LifecycleObserver` (`ON_PAUSE` / `ON_STOP`) | `LOW` |
| `window.beforeunload` | Unreliable on mobile OS process termination | `applicationWillTerminate` / ModelContainer autosave | `onTrimMemory` / SQLite transaction commit | `LOW` |
| `ServiceWorker.sync` | Inconsistent support in WebKit iOS PWA | `BGProcessingTaskRequest` with network constraint | `WorkManager` with `NetworkType.CONNECTED` | `MEDIUM` |
| `AudioContext` Rest Beep | Web Audio muted if backgrounded without audio mode | `AVAudioSession(category: .playback, mode: .default)` | `MediaPlayer` / `SoundPool` in Foreground Svc | `LOW` |

---

## 16. Offline Storage Migration Contract

| Browser Storage Item | Current Format | Purpose | Native iOS Destination | Native Android Destination | Migration Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `calyxo_user_profile` | JSON String in `localStorage` | Profile biometrics & targets | `SwiftData` (`UserProfile` Model) | `Room` (`user_profile_table`) | Initial fetch from Supabase |
| `calyxo_workout_logs` | JSON Array in `localStorage` | Historical gym logs | `SwiftData` (`WorkoutLog` Model) | `Room` (`workout_logs_table`) | Initial fetch from Supabase |
| `calyxo_food_logs` | JSON Array in `localStorage` | Historical meal logs | `SwiftData` (`FoodLog` Model) | `Room` (`food_logs_table`) | Initial fetch from Supabase |
| `calyxo_weight_logs` | JSON Array in `localStorage` | Weight history data | `SwiftData` (`WeightLog` Model) | `Room` (`weight_logs_table`) | Initial fetch from Supabase |
| `calyxo_sync_outbox_queue` | JSON Array in `localStorage` | Pending offline sync events | `SwiftData` (`SyncEvent` Model) | `Room` (`sync_outbox_table`) | Native queue initialization |
| `calyxo_ai_chat_sessions` | JSON Array in `localStorage` | AI conversation history | `SwiftData` (`ChatSession` Model) | `Room` (`ai_chat_table`) | Initial fetch from Supabase |
| `calyxo_notif_prefs_v1` | JSON Object in `localStorage`| Notification category toggles | App Group `UserDefaults` | Proto DataStore | Local defaults + sync |
| `calyxo_food_db_cache` | IndexedDB Object Store | 5.4MB Indian food database | Embedded SQLite Database (`FTS5`) | Embedded SQLite Database (`FTS5`)| Bundle static SQLite in app |

---

## 17. Synchronization Contract & Idempotency Rules

### Sync Outbox Event Contract:
```json
{
  "eventId": "evt_WORKOUT_LOG_w_123_1724889600000_a1b2c3d4",
  "dedupeKey": "WORKOUT_LOG_w_123_CREATE_2026-08-28",
  "entityType": "WORKOUT_LOG",
  "entityId": "w_123",
  "operation": "CREATE",
  "payload": { "name": "Chest Hypertrophy", "exercises": [...] },
  "userId": "usr_998877",
  "source": "ios_native",
  "timestamp": 1724889600000,
  "syncStatus": "PENDING",
  "retryCount": 0
}
```

### Sync Rules Enforced on Native Clients:
1. **Idempotent Queueing**: If `dedupeKey` matches an existing pending event in the local outbox, the second enqueue is discarded without error.
2. **Deterministic Merge Strategies**:
   - `WORKOUT_LOG`: Set-by-set union merge. If a set exists in both records, the version with `completed: true` and highest tonnage ($kg \times reps$) is preserved.
   - `WATER_LOG`: Additive merge by unique event timestamp.
   - `USER_SETTINGS`: Last-Write-Wins based on ISO-8601 timestamp.
   - `HEALTH_METRIC`: Deduplicated by composite key `${metricType}_${source}_${minuteBucket}`.
3. **Dead-Letter Queue Durability**: Events failing after 5 exponential backoff retries ($1\text{s}, 2\text{s}, 4\text{s}, 8\text{s}, 16\text{s}$) transition to `FAILED` status and are preserved in local storage for manual retry.

---

## 18. Payment & Subscription Contract

```
                                Client Purchase Flow
                                         │
                  ┌──────────────────────┼──────────────────────┐
                  ▼                      ▼                      ▼
             Calyxo Web             Calyxo iOS            Calyxo Android
          (Razorpay Modal)       (StoreKit 2 API)      (Google Play Billing)
                  │                      │                      │
           Payment Signature       JWS Transaction       Purchase Token
                  │                      │                      │
                  └──────────────────────┼──────────────────────┘
                                         ▼
                      [Vercel Serverless / Backend Edge]
                       `POST /api/verify-subscription`
                                         │
                                         ▼
                       [Supabase `subscriptions` Table]
                        Status: 'Active', Plan: 'HIGH'
```

### Subscription Lifecycle States:
- `FREE`: Default tier; basic logging enabled; AI coaching restricted.
- `HIGH`: Active paid subscription; full AI intelligence, custom workout generators, unlimited history.
- `EXPIRED`: Grace period passed without renewal; access gracefully downgrades to `FREE`.
- `CANCELLED`: User cancelled auto-renewal; `HIGH` tier remains active until `expiry_date`.
- `ADMIN` / `TRAINER`: Platform role override granting perpetual `HIGH` access.

---

## 19. Widget, Live Activity & Watch Contract

| Subsystem Component | Current Codebase Status | Native Implementation File | Parity Requirement |
| :--- | :--- | :--- | :--- |
| **iOS WidgetKit (Small/Med/Large)** | `EXISTS (NATIVE)` | [CalyxoHomeWidgets.swift](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/ios/App/CalyxoWidgets/CalyxoHomeWidgets.swift) | Render real steps, active calories, and recovery gauge from App Group `UserDefaults`. |
| **iOS Live Activities (Dynamic Island)**| `EXISTS (NATIVE)` | [CalyxoLiveActivity.swift](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/ios/App/CalyxoWidgets/CalyxoLiveActivity.swift) | Display active exercise, set number, and rest countdown ring on Lock Screen and Dynamic Island. |
| **Apple Watch Standalone App** | `PARTIAL (NATIVE)` | `ios/App/CalyxoWatch Watch App/` | Stream live heart rate and allow set completion logging via `WatchConnectivity`. |
| **Android AppWidgets (Glance)** | `PARTIAL (LEGACY)` | [CalyxoAppWidgetProvider.java](file:///Users/supreethk/Documents/calyxo/CALYXOAPP/android/app/src/main/java/com/calyxo/app/CalyxoAppWidgetProvider.java) | Modernize to Jetpack Glance Compose AppWidgets for steps, hydration, and calories. |
| **Wear OS Tiles & App** | `MISSING` | `android/wear/` (To be implemented) | Wear OS Tile showing daily quad progress rings + heart rate monitor. |

---

## 20. PWA Retirement Matrix

| Browser / PWA Capability | Source Location | Native Mobile Replacement | Retirement Stage | Public Web Impact |
| :--- | :--- | :--- | :--- | :--- |
| `src/sw.js` (Service Worker) | Root `/sw.js` | Native Compiled Binary Assets | Phase 11 | **Zero Impact** (Service Worker preserved for desktop web). |
| Web Push (VAPID Keys) | `src/services/notificationService.js` | Apple APNs & Firebase FCM | Phase 11 | **Zero Impact** (Retained for desktop browser push). |
| IndexedDB Food Cache | `src/services/health/HealthCache.js` | Embedded SQLite Database (`FTS5`) | Phase 11 | **Zero Impact** (Retained for web browser client). |
| `localStorage` State Storage | `src/store/useStore.js` | `SwiftData` (iOS) & `Room` (Android) | Phase 11 | **Zero Impact** (Retained for web browser client). |
| `NativeMobileBridge.jsx` | `src/components/NativeMobileBridge.jsx` | Retired when native app launches | Phase 11 | **Zero Impact** (Removed from web bundle). |
| `@capacitor/*` Dependencies | `package.json` | Removed from root `package.json` | Phase 11 | **Zero Impact** (Web app runs purely on Vite). |

---

## 21. Feature Parity Contract (50+ Core Capabilities)

| Feature / Capability | Web Status | Current Mobile Status | iOS Target Status | Android Target Status | Parity Verification Test | Device Test Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Email Sign-In & Registration** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Unit Auth Suite | Simulator & Physical Device |
| **2. Sign in with Apple** | `VERIFIED` | `PARTIAL` | `VERIFIED` | `VERIFIED` | ASAuthorization Test | Physical iPhone |
| **3. Sign in with Google** | `VERIFIED` | `PARTIAL` | `VERIFIED` | `VERIFIED` | GoogleSignIn Test | Physical Android Device |
| **4. Biometric Face ID / Touch ID** | `MISSING` | `MISSING` | `VERIFIED` | `VERIFIED` | LocalAuthentication Test| Physical iPhone & Pixel |
| **5. Concentric Quad Progress Rings** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Snapshot Layout Test | 120Hz ProMotion Frame Test |
| **6. Deterministic Recovery Score** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `rc3MasterTestRunner` | Multi-Metric Input Test |
| **7. Clinical Sleep Quality Scorer** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Sleep Scoring Suite | Real Sleep Interval Ingestion |
| **8. Hardware Step Counter** | `PARTIAL` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Pedometer Test | Physical Walk Step Test |
| **9. Hardware Active Energy Ingestion**| `MISSING`| `VERIFIED` | `VERIFIED` | `VERIFIED` | HealthKit Query Test | Apple Watch Energy Sync |
| **10. Continuous Resting Heart Rate** | `MISSING` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Sample Query Test | Apple Health / Health Connect |
| **11. Heart Rate Variability (SDNN)** | `MISSING` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Sample Query Test | Apple Health SDNN Sync |
| **12. Cardiorespiratory VO2 Max** | `MISSING` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Sample Query Test | Apple Health VO2 Sync |
| **13. Set-by-Set Strength Logger** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Set Logging Suite | Real Gym Session Workout |
| **14. Progressive Overload Advisor** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Overload Math Suite | Previous PR Load Compare |
| **15. Rest Interval Countdown Timer** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Timer Interval Suite | Audio & Haptic Alarm Test |
| **16. Dynamic Island Rest HUD** | `MISSING` | `PARTIAL` | `VERIFIED` | `MISSING` | ActivityKit Suite | Physical iPhone 14/15/16 Pro |
| **17. 5-Tier Muscle Stimulus Engine** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `muscleAnalyticsRunner`| Stimulus Volume Aggregation |
| **18. Vector Anatomical Muscle Map** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | SVG Snapshot Test | Interactive Canvas Tap Test |
| **19. Indian Food Database Search** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | SQLite FTS5 Query Test | Offline Search Benchmark |
| **20. Custom Meal Logging & Macros** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Food Logging Suite | Meal Additive Sync Test |
| **21. Quick 1-Tap Hydration Logging** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Water Logging Suite | Lock Screen Action Tap Test |
| **22. Mifflin-St Jeor TDEE Calculator**| `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Macro Calculator Suite | Athlete Biometric Update Test|
| **23. Smart Scale Weight Ingestion** | `MISSING` | `PARTIAL` | `VERIFIED` | `VERIFIED` | BLE Weight GATT Suite | Smart Scale Bluetooth Test |
| **24. Grounded Morning AI Briefing** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | AI Briefing Suite | Real Biometric Briefing Test |
| **25. Interactive AI Coach Chat** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Gemini Gateway Suite | Streaming Markdown Chat Test |
| **26. Medical Safety Red Flag Filter**| `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | AI Safety Guard Suite | Symptom Rejection Test |
| **27. Daily Streak & Leveling Loop** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Ecosystem State Suite | Streak Increment Test |
| **28. Smart Reminders (30-Day Cooldown)**|`VERIFIED`| `VERIFIED` | `VERIFIED` | `VERIFIED` | `smartReminderRunner` | Timezone Transition Test |
| **29. Small Home Screen Widget** | `MISSING` | `PARTIAL` | `VERIFIED` | `PARTIAL` | WidgetKit Snapshot Test | Home Screen Reload Test |
| **30. Medium Dashboard Widget** | `MISSING` | `PARTIAL` | `VERIFIED` | `PARTIAL` | WidgetKit Snapshot Test | Home Screen Reload Test |
| **31. Large Biometrics Widget** | `MISSING` | `PARTIAL` | `VERIFIED` | `PARTIAL` | WidgetKit Snapshot Test | Home Screen Reload Test |
| **32. Apple Watch Companion App** | `MISSING` | `PARTIAL` | `VERIFIED` | `MISSING` | WatchConnectivity Suite| Physical Apple Watch Mirror |
| **33. Bluetooth Chest Strap Driver** | `PARTIAL` | `PARTIAL` | `VERIFIED` | `VERIFIED` | CoreBluetooth Suite | Polar H10 Chest Strap Test |
| **34. Zero Fake Data on Disconnect** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | Sensor Integrity Suite | Instant Disconnect Test |
| **35. Offline Outbox Event Queue** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `syncConflictRunner` | Airplane Mode Workout Log |
| **36. Workout Set Union Merge** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `syncConflictRunner` | Multi-Device Sync Test |
| **37. Hydration Additive Merge** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `syncConflictRunner` | Multi-Device Water Test |
| **38. Settings Last-Write-Wins** | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `syncConflictRunner` | Timestamp Conflict Test |
| **39. Razorpay Web Checkout** | `VERIFIED` | `N/A` | `N/A` | `N/A` | Payment Certification | Web Browser Purchase Test |
| **40. Apple StoreKit 2 Purchases** | `N/A` | `N/A` | `VERIFIED` | `N/A` | StoreKit Testing Suite | Xcode StoreKit Sandbox Test |
| **41. Google Play Billing Client** | `N/A` | `N/A` | `N/A` | `VERIFIED` | Play Billing Suite | Google Play License Tester |
| **42. Super-Admin Operations Console**| `VERIFIED`| `N/A` | `N/A` | `N/A` | Admin Auth & RPC Suite | Desktop Chrome Browser Test |

---

## 22. Safest Implementation Sequence

```text
PHASE 1: Shared Domain Extraction & Model Codification
├── Prerequisites: Phase 3B contract approval.
├── Files Created: Swift & Kotlin pure domain engine files.
├── Changes: Zero changes to existing web repository.
├── Tests: Re-run canonical test vectors against Swift/Kotlin test harnesses.
└── Rollback: Delete standalone domain package if validation fails.

PHASE 2: Standalone Native Project Initialization & Authentication
├── Prerequisites: Phase 1 domain models verified.
├── Files Created: iOS `ios/CalyxoApp.swift` & Android `CalyxoApplication.kt`.
├── Changes: Configure `supabase-swift` and `supabase-kt` with existing Supabase keys.
├── Tests: Authenticate with existing test user accounts; verify JWT token generation.
└── Rollback: Reset native project directory.

PHASE 3: HealthKit & Health Connect Platform Integration
├── Prerequisites: Phase 2 authentication verified.
├── Files Created: `HealthKitManager.swift` and `HealthConnectManager.kt`.
├── Changes: Request native OS health permissions; query cumulative steps & sleep.
├── Tests: Verify zero fake data emission and correct data freshness states.
└── Rollback: Fallback to manual logging state.

PHASE 4: Bluetooth Low Energy & Hardware Drivers
├── Prerequisites: Phase 3 health subsystem operational.
├── Files Created: `BluetoothManager.swift` and `BleHeartRateManager.kt`.
├── Changes: Implement CoreBluetooth and Android BluetoothGatt delegates.
├── Tests: Connect to real Polar H10 chest strap; verify zero-fake disconnect handling.
└── Rollback: Disconnect peripheral and emit null state.

PHASE 5: Notifications, Reminders & Background Schedulers
├── Prerequisites: Phase 4 completed.
├── Files Created: `NotificationScheduler.swift` and `WorkManager` workers.
├── Changes: Register local notification categories (`LOG_WATER_250`, `LOG_MEAL`).
├── Tests: Verify quiet hours suppression and accurate local timezone evaluation.
└── Rollback: Clear scheduled local notification queue.

PHASE 6: Offline Outbox & Supabase Data Synchronization
├── Prerequisites: Phase 5 completed.
├── Files Created: `OutboxManager.swift` (SwiftData) and `SyncOutboxWorker.kt` (Room).
├── Changes: Implement event queueing with deterministic conflict resolution.
├── Tests: Run offline flight-mode workout logging and verify union merge upon reconnect.
└── Rollback: Rollback local SQLite database to pre-sync snapshot.

PHASE 7: In-App Purchases (StoreKit 2 & Google Play Billing)
├── Prerequisites: Phase 6 completed.
├── Files Created: `StoreKitManager.swift` and `PlayBillingManager.kt`.
├── Changes: Implement StoreKit 2 purchase sheet and backend receipt verification.
├── Tests: Execute Sandbox purchase and verify `subscriptions` table entitlement update.
└── Rollback: Revoke entitlement and revert user to `FREE` tier.

PHASE 8: Native Product UI & Visual Experience
├── Prerequisites: Phases 1–7 fully certified.
├── Files Created: SwiftUI Views and Jetpack Compose Composable screens.
├── Changes: Assemble Dashboard, Workout Logger, Food Tracker, and Profile.
├── Tests: Snapshot testing, accessibility TalkBack/VoiceOver audit, 120Hz frame test.
└── Rollback: Revert to previous UI component tree.

PHASE 9: Physical Hardware Quality Assurance & Stress Testing
├── Prerequisites: Phase 8 UI complete.
├── Devices: iPhone 14/15/16 Pro, Apple Watch Series 8/9/Ultra, Pixel 7/8/9, Galaxy Watch.
├── Tests: Battery drain profiling (<0.5%/day), memory leak profiling, zero-fake audit.
└── Rollback: Hotfix individual native subsystem.

PHASE 10: App Store & Google Play Distribution
├── Prerequisites: Phase 9 QA sign-off.
├── Distribution: TestFlight Public Beta -> Production App Store & Google Play.
├── Rollback: Phased release halt / TestFlight build revocation.

PHASE 11: Capacitor Retirement & Repository Optimization
├── Prerequisites: Production native apps deployed and adopted.
├── Changes: Remove `@capacitor/*` from root `package.json`; delete `NativeMobileBridge.jsx`.
├── Tests: Full regression test of desktop web application on Vercel.
└── Rollback: Restore `package.json` from git tag.
```

---

## 23. Rollback Architecture & Disaster Recovery

| Subsystem Failure | Immediate Failure Symptom | Native Rollback Mechanism | Fallback Operational State |
| :--- | :--- | :--- | :--- |
| **Auth Failure** | Native login throws 401 / Invalid JWT | Catch exception; clear Keychain token; present login UI | User logs in via Web browser OAuth |
| **Database Corruption** | SwiftData / Room schema mismatch | Wipe local SQLite cache; re-fetch from Supabase cloud | Re-hydration from Supabase in $<2\text{s}$ |
| **Sync Deadlock** | Outbox queue stuck on invalid payload | Move offending event to Dead-Letter Queue table; continue | Unblocks subsequent sync events |
| **Payment Failure** | StoreKit transaction verification error | Store unverified JWS locally; queue for automatic retry | Grant temporary 24h grace access |
| **HealthKit Error** | User denies HealthKit permissions | Catch authorization denial; emit `available: false` | Seamless fallback to manual logging |
| **Health Connect Bug** | Health Connect SDK crashes on older OS | Catch `HealthConnectException`; disable background worker| Fallback to SensorManager / manual |
| **BLE Dropout** | Peripheral disconnects during set | Emit `nil` BPM; show non-blocking reconnect toast | Workout continues without HR telemetry |
| **App Store Rejection**| Metadata or Guideline 3.1.1 issue | Address specific reviewer note in StoreKit sheet | Web & current Capacitor app remain live |

---

## 24. Native Migration Protected Boundaries (DO NOT TOUCH)

The following systems are **strictly protected and must NOT be altered or disrupted**:

```text
DO NOT TOUCH PROTECTED BOUNDARY
├── 1. Production Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
├── 2. Existing User Records, Auth Tokens & Password Hashes
├── 3. Public SEO Website Landing Pages (/, /ecosystem, /philosophy, /vision, /app)
├── 4. Public Legal & Compliance Pages (/privacy, /terms, /accessibility)
├── 5. Desktop Super-Admin Operations Console (/admin/*)
├── 6. Desktop Trainer CRM & Document Verification Subsystem
├── 7. Serverless Edge APIs (/api/create-order, /api/verify-payment, /api/gemini)
├── 8. Razorpay Web Gateway Integration for Desktop Subscribers
└── 9. Core Mathematical Specifications (Deterministic Recovery & Muscle Stimulus)
```

---

## 25. Implementation Readiness Gate

### Final Architectural Verdict:
**`GO`**

### Gate Evaluation Summary:
1. **Mathematical Models Codified**: Recovery scoring, muscle taxonomy, and macro calculations are fully decoupled and verified by automated test runners.
2. **Data Continuity Guaranteed**: Backend Supabase schemas, UUID keys, and RLS policies are 100% compatible with native client SDKs (`supabase-swift` and `supabase-kt`).
3. **Native Assets Pre-Existing**: iOS WidgetKit, Live Activities Dynamic Island, and watchOS structures already exist in Swift and require zero reverse-engineering.
4. **Protected Boundaries Secured**: Public marketing web pages, administrative tooling, and payment APIs remain completely isolated from mobile native development.
5. **Zero Code Disruption**: Current production web and Capacitor application code remains 100% untouched.

**Phase 4 implementation may begin following the exact 11-phase sequence defined in Section 22.**
