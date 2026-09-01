# CALYXO — PHASE 6 WORKOUT ENGINE FORENSIC AUDIT

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 6 — Workout Subsystem Forensic Architecture & Trace Audit  
**Date**: August 28, 2026  

---

## 1. Trace of Existing Workout Lifecycle

```text
1. Discovery & Selection:
   - File: src/components/WorkoutLogger.js, src/utils/exerciseSearch.js
   - Splits: Push/Pull/Legs, Upper/Lower, Full Body
   - Search: Ranked fuzzy search against exercise database with body-part targets

2. Session Initiation & Exercise Queue:
   - State: Active workout session holds `sessionTitle`, `exercises[]`, `activeSetIndex`, `elapsedSeconds`
   - UI: WorkoutHeroIntent & WorkoutExerciseCard components

3. Set Logging & Validation:
   - Parameters: `setNumber` (Int >= 1), `weight` (Double >= 0.0), `reps` (Int >= 1), `rpe` (Int 1-10)
   - Action: User marks set complete -> increments volume -> triggers native Rest Timer

4. Rest Timer Lifecycle:
   - Service: src/services/restTimerPersistence.js, src/services/LiveActivityManager.js
   - Synchronization: Apple ActivityKit Dynamic Island + Lock Screen widget + OS local notification

5. Workout Completion & Persistence:
   - Service: src/lib/dbService.js -> addWorkoutLog(userId, workout)
   - Table: `workout_logs`
   - Fields: `id`, `userId`, `title`, `category`, `duration`, `calories`, `intensity`, `notes`, `exercises`, `timestamp`

6. Analytics & Recovery Integration:
   - Engine: src/services/health/DeterministicRecoveryEngine.js, src/components/analytics/WorkoutMuscleAnalyticsView.jsx
   - Load: Aggregates total tonnage & target muscle stimulus, feeding the central systemic fatigue score
```

---

## 2. Supabase `workout_logs` Schema Contract

```sql
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Strength',
    duration INTEGER NOT NULL DEFAULT 30,
    calories INTEGER NOT NULL DEFAULT 150,
    intensity TEXT NOT NULL DEFAULT 'Medium',
    notes TEXT DEFAULT '',
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    timestamp BIGINT NOT NULL
);
```

---

## 3. Native Migration Requirements

1. **iOS Native Engine**: Pure Swift/SwiftUI implementation with `NavigationStack`, live workout session coordinator, haptic feedback on set completion, and `ActivityKit` / `WCSession` live mirroring.
2. **Android Native Engine**: Jetpack Compose / Java implementation with coroutines, local room/shared outbox, and foreground timer notification.
3. **Cross-Platform Math Equivalence**: Both platforms calculate volume ($\sum \text{weight} \times \text{reps}$) and muscle stimulus identically.
