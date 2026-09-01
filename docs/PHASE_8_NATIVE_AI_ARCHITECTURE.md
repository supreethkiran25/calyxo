# CALYXO — PHASE 8 NATIVE AI COACH ARCHITECTURE SPECIFICATION

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 8 — Native Dual-Platform AI Coach Architecture  
**Platforms Covered**: iOS (Swift / SwiftUI), Android (Kotlin / Jetpack Compose / Java)  
**Date**: August 28, 2026  

---

## 1. Native Dual-Platform AI Coach Architecture

```mermaid
graph TD
    subgraph NativePresentation["1. Native AI Presentation Layer"]
        iOSHub["CalyxoNativeAIIntelligenceHubView (SwiftUI)"]
        AndroidHub["CalyxoNativeAIIntelligenceHub (Compose)"]
        ContextChips["Quick Context Prompt Chips"]
        ChatInput["Native Secure Text Input & Send"]
    end

    subgraph NativeAIEngine["2. Native AI Service & Context Aggregator"]
        AIService["CalyxoNativeAIService (Session & Dispatch)"]
        AIContext["CalyxoNativeAIContextProvider (Grounded Context)"]
        ChatSession["ChatSessionManager (clearConversation contract)"]
    end

    subgraph NativeDomainLayers["3. Local Verified Domain Engines"]
        NutritionEngine["CalyxoNativeNutritionEngine (Calories/Protein)"]
        WorkoutEngine["CalyxoNativeWorkoutEngine (Volume/Active Set)"]
        HealthManager["CalyxoNativeHealthKitManager / HealthConnect"]
        DataRepos["CalyxoDataRepositories (Profile / Subscription)"]
    end

    subgraph SecureBackend["4. Server-Side AI Intelligence Gateway"]
        ServerEndpoint["POST /api/gemini (Supabase JWT Validated)"]
        GeminiPro["Google Gemini AI Model (Server-Side Secrets)"]
    end

    iOSHub --> AIService
    AndroidHub --> AIService
    iOSHub --> ContextChips
    iOSHub --> ChatInput

    AIService --> AIContext
    AIService --> ChatSession

    AIContext --> NutritionEngine
    AIContext --> WorkoutEngine
    AIContext --> HealthManager
    AIContext --> DataRepos

    AIService --> ServerEndpoint
    ServerEndpoint --> GeminiPro
```
