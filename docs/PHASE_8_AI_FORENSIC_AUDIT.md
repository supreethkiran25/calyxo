# CALYXO — PHASE 8 AI ENGINE FORENSIC AUDIT

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 8 — AI Intelligence Hub Forensic Architecture & Trace Audit  
**Date**: August 28, 2026  

---

## 1. Trace of Existing AI Architecture

```text
1. Client Presentation:
   - File: src/components/ai/AIIntelligenceHub.jsx, src/components/modals/AIChatModal.js
   - Manages: Chat message list, prompt chips, input box, loading skeleton, voice dictation

2. Session Management:
   - File: src/services/ai/ChatSessionManager.js
   - Functions:
     • setUser(userId): Scopes storage keys by user UUID (e.g. `calyxo_ai_sessions_v2_<userId>`)
     • createSession({ title, role, userName }): Creates session object with default welcome message
     • clearConversation(sessionId): Wipes session messages, resets to welcome message, returns boolean `true`
     • deleteSession(sessionId): Hard deletion across in-memory and local storage

3. User Context Aggregation:
   - Profile: Name, age, gender, goals, target calories, weight
   - Nutrition: Today's consumed calories, protein, carbs, fat, logged meals
   - Workouts: Recent workout title, duration, volume, exercises, completed sets
   - Recovery: Deterministic recovery score (0-100), resting HR, sleep duration
   - Biometrics: Live/recent steps, active calories, sensor status

4. AI Execution Pipeline:
   - File: src/services/geminiService.js -> calls /api/gemini (or Google Generative AI gateway)
   - Headers: `Authorization: Bearer <Supabase JWT>`, `Content-Type: application/json`
   - Payload: `{ prompt: String, context: Object }`
   - Server: api/gemini.js validates JWT, checks rate limits (20 req/min), verifies subscription quota, invokes Gemini with strict system instructions, and returns `{ text: String, isFallback: Boolean }`

5. Truthfulness & Grounding Contract:
   - Rule: The AI must never invent, guess, or hallucinate metrics not present in the verified context payload.
   - Missing readings (e.g. steps null, sleep 0.0) must be represented as `UNAVAILABLE` or `NO_DATA`.
```

---

## 2. Hard Security Constraints

- **NO API Keys in Client**: Neither iOS Swift nor Android Kotlin/Java source code will ever embed Gemini API keys or service role secrets.
- **JWT Authorization Required**: Every AI request passes the user's active session token in the `Authorization: Bearer` header.
