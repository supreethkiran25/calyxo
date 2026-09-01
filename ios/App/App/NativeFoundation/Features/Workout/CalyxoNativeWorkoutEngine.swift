//
//  CalyxoNativeWorkoutEngine.swift
//  Calyxo Native Workout Engine
//
//  Production-Grade Native Gym Tracker & Real-Time Volume Engine for iOS.
//  Zero React / WebView dependency.
//  Coordinates active sets, rest timers, volume calculations, and Supabase persistence.
//

import Foundation
import SwiftUI

public final class CalyxoNativeWorkoutEngine: ObservableObject {
    public static let shared = CalyxoNativeWorkoutEngine()
    
    // MARK: - Models
    public struct WorkoutSet: Identifiable, Codable {
        public let id: UUID
        public var setNumber: Int
        public var weightKg: Double
        public var reps: Int
        public var rpe: Int?
        public var isCompleted: Bool
        public var completedAt: Date?
        
        public init(setNumber: Int, weightKg: Double, reps: Int, rpe: Int? = nil, isCompleted: Bool = false) {
            self.id = UUID()
            self.setNumber = setNumber
            self.weightKg = max(0.0, weightKg)
            self.reps = max(1, reps)
            self.rpe = rpe
            self.isCompleted = isCompleted
            self.completedAt = isCompleted ? Date() : nil
        }
    }
    
    public struct WorkoutExercise: Identifiable, Codable {
        public let id: UUID
        public let exerciseId: String
        public let name: String
        public let category: String
        public var sets: [WorkoutSet]
        
        public init(exerciseId: String, name: String, category: String, sets: [WorkoutSet] = []) {
            self.id = UUID()
            self.exerciseId = exerciseId
            self.name = name
            self.category = category
            self.sets = sets.isEmpty ? [WorkoutSet(setNumber: 1, weightKg: 60.0, reps: 10)] : sets
        }
    }
    
    public struct WorkoutSession: Identifiable, Codable {
        public let id: UUID
        public var title: String
        public var category: String
        public var startedAt: Date
        public var completedAt: Date?
        public var exercises: [WorkoutExercise]
        
        public init(title: String, category: String = "Strength", exercises: [WorkoutExercise] = []) {
            self.id = UUID()
            self.title = title
            self.category = category
            self.startedAt = Date()
            self.completedAt = nil
            self.exercises = exercises
        }
        
        public var totalVolumeKg: Double {
            var total = 0.0
            for ex in exercises {
                for s in ex.sets where s.isCompleted {
                    total += s.weightKg * Double(s.reps)
                }
            }
            return total
        }
        
        public var completedSetCount: Int {
            return exercises.reduce(0) { count, ex in
                count + ex.sets.filter { $0.isCompleted }.count
            }
        }
    }
    
    // MARK: - Published State
    @Published public private(set) var activeSession: WorkoutSession?
    @Published public private(set) var isRestTimerActive: Bool = false
    @Published public private(set) var restRemainingSeconds: Int = 0
    @Published public private(set) var totalRestDurationSeconds: Int = 90
    
    private var restTimer: Timer?
    private var restTargetTimestamp: Date?
    
    private let authService = CalyxoNativeAuthService.shared
    private let watchManager = CalyxoWatchSessionManager.shared
    
    private init() {}
    
    // MARK: - Start Workout Session
    public func startSession(title: String = "Chest & Triceps Hypertrophy", category: String = "Strength") {
        let initialExercises = [
            WorkoutExercise(exerciseId: "bench_press", name: "Barbell Bench Press", category: "Chest", sets: [
                WorkoutSet(setNumber: 1, weightKg: 80.0, reps: 10),
                WorkoutSet(setNumber: 2, weightKg: 85.0, reps: 8),
                WorkoutSet(setNumber: 3, weightKg: 90.0, reps: 6)
            ]),
            WorkoutExercise(exerciseId: "incline_dumbbell_press", name: "Incline Dumbbell Press", category: "Chest", sets: [
                WorkoutSet(setNumber: 1, weightKg: 32.0, reps: 10),
                WorkoutSet(setNumber: 2, weightKg: 34.0, reps: 8)
            ])
        ]
        
        self.activeSession = WorkoutSession(title: title, category: category, exercises: initialExercises)
        print("[CALYXO-WORKOUT] 🏋️‍♂️ Native Workout Session Started: \(title)")
    }
    
    // MARK: - Add Exercise to Active Session
    public func addExercise(name: String, category: String = "Strength") {
        guard var session = activeSession else { return }
        let newEx = WorkoutExercise(exerciseId: UUID().uuidString, name: name, category: category)
        session.exercises.append(newEx)
        self.activeSession = session
    }
    
    // MARK: - Add Set to Exercise
    public func addSet(to exerciseId: UUID) {
        guard var session = activeSession,
              let exIndex = session.exercises.firstIndex(where: { $0.id == exerciseId }) else { return }
        
        let lastSet = session.exercises[exIndex].sets.last
        let nextSetNumber = (lastSet?.setNumber ?? 0) + 1
        let weight = lastSet?.weightKg ?? 60.0
        let reps = lastSet?.reps ?? 10
        
        let newSet = WorkoutSet(setNumber: nextSetNumber, weightKg: weight, reps: reps)
        session.exercises[exIndex].sets.append(newSet)
        self.activeSession = session
    }
    
    // MARK: - Complete Set & Trigger Rest Timer
    public func completeSet(exerciseId: UUID, setId: UUID, restDuration: Int = 90) {
        guard var session = activeSession,
              let exIndex = session.exercises.firstIndex(where: { $0.id == exerciseId }),
              let setIndex = session.exercises[exIndex].sets.firstIndex(where: { $0.id == setId }) else { return }
        
        session.exercises[exIndex].sets[setIndex].isCompleted.toggle()
        session.exercises[exIndex].sets[setIndex].completedAt = session.exercises[exIndex].sets[setIndex].isCompleted ? Date() : nil
        self.activeSession = session
        
        if session.exercises[exIndex].sets[setIndex].isCompleted {
            startRestTimer(seconds: restDuration, exerciseName: session.exercises[exIndex].name, setNumber: session.exercises[exIndex].sets[setIndex].setNumber)
        }
    }
    
    // MARK: - Rest Timer Execution (Timestamp based)
    public func startRestTimer(seconds: Int = 90, exerciseName: String = "Exercise", setNumber: Int = 1) {
        self.totalRestDurationSeconds = seconds
        self.restRemainingSeconds = seconds
        self.restTargetTimestamp = Date().addingTimeInterval(TimeInterval(seconds))
        self.isRestTimerActive = true
        
        // Notify Apple Watch Companion
        watchManager.sendWorkoutState(
            CalyxoWatchSessionManager.WorkoutMirrorPayload(
                workoutId: activeSession?.id.uuidString ?? "",
                exerciseName: exerciseName,
                setNumber: setNumber,
                targetReps: 10,
                targetWeightKg: 80.0,
                restRemainingSeconds: seconds,
                isRestActive: true
            )
        )
        
        restTimer?.invalidate()
        restTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self, let target = self.restTargetTimestamp else { return }
            let remaining = Int(target.timeIntervalSince(Date()))
            if remaining <= 0 {
                self.stopRestTimer()
            } else {
                DispatchQueue.main.async {
                    self.restRemainingSeconds = remaining
                }
            }
        }
    }
    
    public func stopRestTimer() {
        restTimer?.invalidate()
        restTimer = nil
        self.isRestTimerActive = false
        self.restRemainingSeconds = 0
        self.restTargetTimestamp = nil
        print("[CALYXO-WORKOUT] ⏰ Rest timer ended.")
    }
    
    // MARK: - Finish Session & Persist to Supabase
    public func finishWorkout(completion: ((Bool) -> Void)? = nil) {
        guard var session = activeSession, let currentSession = authService.currentSession else {
            completion?(false)
            return
        }
        
        session.completedAt = Date()
        stopRestTimer()
        
        let durationMinutes = max(1, Int(session.completedAt!.timeIntervalSince(session.startedAt) / 60.0))
        let totalVolume = session.totalVolumeKg
        let estimatedCalories = Int(Double(durationMinutes) * 6.5)
        
        // Map to Supabase workout_logs schema
        let payload: [String: Any] = [
            "id": session.id.uuidString,
            "userId": currentSession.userUUID,
            "title": session.title,
            "category": session.category,
            "duration": durationMinutes,
            "calories": estimatedCalories,
            "intensity": "High",
            "notes": "Logged via Calyxo iOS Native Engine. Total volume: \(Int(totalVolume)) kg",
            "exercises": session.exercises.map { ex in
                [
                    "name": ex.name,
                    "category": ex.category,
                    "sets": ex.sets.map { s in
                        ["setNumber": s.setNumber, "weight": s.weightKg, "reps": s.reps, "completed": s.isCompleted]
                    }
                ]
            },
            "timestamp": Int64(Date().timeIntervalSince1970 * 1000)
        ]
        
        let endpoint = URL(string: "https://nwcatvlfoayzrwatvyrf.supabase.co/rest/v1/workout_logs")!
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(authService.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(currentSession.accessToken)", forHTTPHeaderField: "Authorization")
        request.addValue("return=representation", forHTTPHeaderField: "Prefer")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
        } catch {
            completion?(false)
            return
        }
        
        URLSession.shared.dataTask(with: request) { [weak self] _, response, error in
            let success = (error == nil)
            DispatchQueue.main.async {
                print("[CALYXO-WORKOUT] ✅ Workout persisted to Supabase (Success: \(success)) with total volume \(Int(totalVolume)) kg")
                self?.activeSession = nil
                completion?(success)
            }
        }.resume()
    }
}
