# CALYXO — CANONICAL NATIVE WORKOUT DATA CONTRACT

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 6 — Canonical Dual-Platform Workout Domain Contract  
**Platforms Covered**: iOS (Swift / SwiftUI), Android (Kotlin / Jetpack Compose / Java)  
**Date**: August 28, 2026  

---

## 1. Canonical Domain Entity Model

```text
struct WorkoutSession {
    let id: UUID                        // Unique session UUID
    let userId: UUID                    // Authenticated athlete UUID
    let title: String                   // Workout title (e.g. "Push Hypertrophy A")
    let category: WorkoutCategory       // Strength, Hypertrophy, Cardio, HIIT, Mobility
    let startedAt: Date                 // Timestamp when workout started
    var completedAt: Date?              // Timestamp when finished (null if active)
    var durationMinutes: Int            // Elapsed time in minutes
    var estimatedCalories: Int          // Estimated or HealthKit-measured active kcal
    var intensity: WorkoutIntensity     // Low, Medium, High, Maximum
    var notes: String                   // Athlete session notes
    var exercises: [WorkoutExercise]    // Ordered exercise entries
    let timestamp: Int64                // Milliseconds epoch timestamp for sorting
}

struct WorkoutExercise {
    let exerciseId: String              // Canonical exercise identifier (e.g. "barbell_bench_press")
    let name: String                    // Display name (e.g. "Barbell Bench Press")
    let category: String                // Muscle group category (e.g. "Chest")
    let targetMuscles: [String]         // Primary & secondary muscle groups
    var sets: [WorkoutSet]              // Completed & pending sets
}

struct WorkoutSet {
    let id: UUID                        // Set UUID
    let setNumber: Int                  // 1-indexed sequential set number
    var weightKg: Double                // Resistance in kilograms (>= 0.0)
    var reps: Int                       // Executed repetitions (>= 1)
    var rpe: Int?                       // Rate of Perceived Exertion (1 to 10)
    var durationSeconds: Int?           // Duration for timed sets
    var restDurationSeconds: Int        // Prescribed rest duration in seconds (e.g. 90)
    var isCompleted: Bool               // Completion status
    var completedAt: Date?              // Exact timestamp of set completion
}
```

---

## 2. Mathematical Contracts

### 1. Volume Calculation
$$\text{Total Volume (kg)} = \sum_{e \in \text{Exercises}} \sum_{s \in \text{Sets}} \left( s.\text{weightKg} \times s.\text{reps} \right) \quad \text{where } s.\text{isCompleted} = \text{true}$$

### 2. Muscle Stimulus Contribution
$$\text{MuscleStimulus}(m) = \sum_{e \in \text{Exercises}[m]} \text{SetCount}(e) \times \text{IntensityFactor}(e.\text{rpe})$$

### 3. Rest Timer Countdown
$$\text{RemainingSeconds} = \max\left(0, \text{TargetRestSeconds} - (\text{CurrentTime} - \text{SetCompletedTime})\right)$$
- Survives backgrounding by relying exclusively on absolute wall-clock timestamps rather than interval ticks.
