import Foundation
import ActivityKit
import SwiftUI

// CalyxoActivityAttributes is defined in CalyxoActivityAttributes.swift (shared between both targets)

// Native Swift Bridge for Managing Dynamic Island & Lock Screen Live Activities
@objc public class CalyxoLiveActivityBridge: NSObject {
    @objc public static let shared = CalyxoLiveActivityBridge()
    
    private override init() {
        super.init()
    }
    
    @objc public func areActivitiesEnabled() -> Bool {
        if #available(iOS 16.1, *) {
            let enabled = ActivityAuthorizationInfo().areActivitiesEnabled
            print("[CALYXO-LIVE] areActivitiesEnabled = \(enabled)")
            return enabled
        }
        print("[CALYXO-LIVE] areActivitiesEnabled = false (iOS < 16.1)")
        return false
    }
    
    @objc public func startActivity(
        title: String,
        workoutName: String,
        exerciseName: String,
        currentSet: Int,
        totalSets: Int,
        currentReps: Int,
        isResting: Bool,
        restDurationSeconds: Int,
        caloriesBurned: Int,
        heartRate: Int
    ) -> [String: Any] {
        if #available(iOS 16.1, *) {
            guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                print("[CALYXO-LIVE] Activity.request BLOCKED: areActivitiesEnabled is false")
                return ["success": false, "error": "Live Activities are disabled in iOS Settings for Calyxo."]
            }
            
            // Check if an activity is already running — reuse or update it
            if let existing = Activity<CalyxoActivityAttributes>.activities.first {
                print("[CALYXO-LIVE] Found existing active Live Activity ID: \(existing.id). Updating instead of duplicating.")
                updateActivity(
                    id: existing.id,
                    exerciseName: exerciseName,
                    currentSet: currentSet,
                    totalSets: totalSets,
                    currentReps: currentReps,
                    isResting: isResting,
                    restDurationSeconds: restDurationSeconds,
                    caloriesBurned: caloriesBurned,
                    heartRate: heartRate,
                    isPaused: false
                )
                return ["success": true, "activityId": existing.id]
            }
            
            let now = Date()
            var restStart: Date? = nil
            var restEnd: Date? = nil
            if isResting && restDurationSeconds > 0 {
                restStart = now
                restEnd = now.addingTimeInterval(TimeInterval(restDurationSeconds))
            }
            
            let attributes = CalyxoActivityAttributes(title: title)
            let initialState = CalyxoActivityAttributes.ContentState(
                workoutName: workoutName.isEmpty ? "Calyxo Workout" : workoutName,
                exerciseName: exerciseName,
                currentSet: max(1, currentSet),
                totalSets: max(1, totalSets),
                currentReps: max(1, currentReps),
                isResting: isResting,
                restStartDate: restStart,
                restEndDate: restEnd,
                workoutStartDate: now,
                caloriesBurned: max(0, caloriesBurned),
                heartRate: max(0, heartRate),
                isPaused: false
            )
            
            do {
                print("[CALYXO-LIVE] Requesting Activity with attributes title: \(title), workout: \(workoutName), exercise: \(exerciseName)")
                if #available(iOS 16.2, *) {
                    let activity = try Activity<CalyxoActivityAttributes>.request(
                        attributes: attributes,
                        content: .init(state: initialState, staleDate: nil)
                    )
                    print("[CALYXO-LIVE] Activity.request SUCCEEDED with ID: \(activity.id)")
                    return ["success": true, "activityId": activity.id]
                } else {
                    let activity = try Activity<CalyxoActivityAttributes>.request(
                        attributes: attributes,
                        contentState: initialState
                    )
                    print("[CALYXO-LIVE] Activity.request (iOS 16.1) SUCCEEDED with ID: \(activity.id)")
                    return ["success": true, "activityId": activity.id]
                }
            } catch {
                print("[CALYXO-LIVE] Activity.request FAILED with error: \(error.localizedDescription)")
                return ["success": false, "error": error.localizedDescription]
            }
        } else {
            print("[CALYXO-LIVE] ActivityKit is only available on iOS 16.1+")
            return ["success": false, "error": "ActivityKit requires iOS 16.1 or higher."]
        }
    }
    
    @objc public func updateActivity(
        id: String,
        exerciseName: String,
        currentSet: Int,
        totalSets: Int,
        currentReps: Int,
        isResting: Bool,
        restDurationSeconds: Int,
        caloriesBurned: Int,
        heartRate: Int,
        isPaused: Bool
    ) {
        if #available(iOS 16.1, *) {
            Task {
                let activeList = Activity<CalyxoActivityAttributes>.activities
                print("[CALYXO-LIVE] updateActivity called for ID: \(id). Active activities count: \(activeList.count)")
                
                for activity in activeList where (id.isEmpty || activity.id == id) {
                    let currentWorkoutName: String
                    let workoutStart: Date
                    if #available(iOS 16.2, *) {
                        currentWorkoutName = activity.content.state.workoutName
                        workoutStart = activity.content.state.workoutStartDate
                    } else {
                        currentWorkoutName = activity.contentState.workoutName
                        workoutStart = activity.contentState.workoutStartDate
                    }

                    let now = Date()
                    var restStart: Date? = nil
                    var restEnd: Date? = nil
                    if isResting && restDurationSeconds > 0 {
                        restStart = now
                        restEnd = now.addingTimeInterval(TimeInterval(restDurationSeconds))
                    }

                    let updatedState = CalyxoActivityAttributes.ContentState(
                        workoutName: currentWorkoutName,
                        exerciseName: exerciseName,
                        currentSet: max(1, currentSet),
                        totalSets: max(1, totalSets),
                        currentReps: max(1, currentReps),
                        isResting: isResting,
                        restStartDate: restStart,
                        restEndDate: restEnd,
                        workoutStartDate: workoutStart,
                        caloriesBurned: max(0, caloriesBurned),
                        heartRate: max(0, heartRate),
                        isPaused: isPaused
                    )

                    if #available(iOS 16.2, *) {
                        await activity.update(.init(state: updatedState, staleDate: nil))
                    } else {
                        await activity.update(using: updatedState)
                    }
                    print("[CALYXO-LIVE] Live Activity updated ID: \(activity.id) | Resting: \(isResting) | Exercise: \(exerciseName)")
                }
            }
        }
    }
    
    @objc public func endActivity(id: String) {
        if #available(iOS 16.1, *) {
            Task {
                let activeList = Activity<CalyxoActivityAttributes>.activities
                print("[CALYXO-LIVE] endActivity called. Total active: \(activeList.count)")
                
                for activity in activeList where (id.isEmpty || activity.id == id) {
                    if #available(iOS 16.2, *) {
                        await activity.end(nil, dismissalPolicy: .immediate)
                    } else {
                        await activity.end(dismissalPolicy: .immediate)
                    }
                    print("[CALYXO-LIVE] Live Activity ended ID: \(activity.id)")
                }
            }
        }
    }
}
