# CALYXO — CANONICAL NATIVE AI COACH CONTRACT

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 8 — Canonical Dual-Platform AI Coach Contract  
**Platforms Covered**: iOS (Swift / SwiftUI), Android (Kotlin / Jetpack Compose / Java)  
**Date**: August 28, 2026  

---

## 1. Canonical Request & Context Data Model

```text
struct AICoachRequest {
    let prompt: String                  // Athlete's input message
    let sessionId: String               // Active chat session UUID
    let context: AIAthleteContext       // Grounded factual athlete context
}

struct AIAthleteContext {
    let athleteName: String             // Athlete display name
    let calorieGoal: Int                // Target calories
    let proteinGoalGrams: Double        // Target protein (g)
    let todayConsumedCalories: Int      // Factual consumed calories from food logs
    let todayConsumedProteinGrams: Double// Factual consumed protein from food logs
    let recentWorkoutTitle: String?     // Title of latest completed workout (null if none)
    let recentWorkoutVolumeKg: Double?  // Volume in kg (null if none)
    let recoveryScore: Int?             // Deterministic recovery score 0-100 (null if none)
    let dailySteps: Int?                // Verified steps from HealthKit/Health Connect (null if disconnected)
    let sleepHours: Double?             // Verified sleep duration in hours (null if none)
    let isProSubscriber: Bool           // Subscription status
}
```

---

## 2. Canonical Response & Session Model

```text
struct AICoachResponse {
    let text: String                    // Grounded AI response text
    let isFallback: Bool                // True if generated via rule-based fallback
    let timestamp: Date                 // Timestamp of response
    let sessionId: String               // Session ID
}

struct ChatMessage: Identifiable, Codable {
    let id: UUID                        // Unique message UUID
    let role: MessageRole               // .user or .assistant
    let text: String                    // Message content
    let timestamp: Date                 // Timestamp
}

enum MessageRole: String, Codable {
    case user = "user"
    case assistant = "assistant"
}
```

---

## 3. Truthfulness & Grounding Axioms

1. **Zero Hallucination of Metrics**: If `dailySteps` is `nil` / `null`, the AI must NEVER say "You walked 8,000 steps today". It must say "I don't have your step data right now."
2. **Deterministic Context Construction**: Context is built dynamically from verified local repositories (`CalyxoNativeNutritionEngine`, `CalyxoNativeWorkoutEngine`, `CalyxoNativeHealthKitManager`).
3. **Session Lifecycle Operations**:
   - `clearConversation()` resets the active session messages to the default welcome message and returns `true`.
