import Foundation
import ActivityKit
import SwiftUI

// ActivityAttributes defining dynamic state for iOS Dynamic Island & Lock Screen
@available(iOS 16.1, *)
public struct CalyxoActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var workoutName: String
        public var exerciseName: String
        public var currentSet: Int
        public var currentReps: Int
        public var restSecondsRemaining: Int
        public var elapsedTimeSeconds: Int
        public var caloriesBurned: Int
        public var heartRate: Int
        public var isPaused: Bool
        
        public init(
            workoutName: String,
            exerciseName: String = "Barbell Bench Press",
            currentSet: Int = 1,
            currentReps: Int = 10,
            restSecondsRemaining: Int = 0,
            elapsedTimeSeconds: Int = 0,
            caloriesBurned: Int = 0,
            heartRate: Int = 115,
            isPaused: Bool = false
        ) {
            self.workoutName = workoutName
            self.exerciseName = exerciseName
            self.currentSet = currentSet
            self.currentReps = currentReps
            self.restSecondsRemaining = restSecondsRemaining
            self.elapsedTimeSeconds = elapsedTimeSeconds
            self.caloriesBurned = caloriesBurned
            self.heartRate = heartRate
            self.isPaused = isPaused
        }
    }
    
    public var title: String
    
    public init(title: String) {
        self.title = title
    }
}

// Native Swift Bridge for Managing Dynamic Island Live Activities
@objc public class CalyxoLiveActivityBridge: NSObject {
    @objc public static let shared = CalyxoLiveActivityBridge()
    
    private override init() {
        super.init()
    }
    
    @objc public func startActivity(title: String, workoutName: String, exerciseName: String) -> String? {
        if #available(iOS 16.1, *) {
            guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                print("[CalyxoLiveActivityBridge] Live Activities are disabled by user settings.")
                return nil
            }
            
            let attributes = CalyxoActivityAttributes(title: title)
            let initialState = CalyxoActivityAttributes.ContentState(
                workoutName: workoutName,
                exerciseName: exerciseName,
                currentSet: 1,
                currentReps: 12,
                restSecondsRemaining: 60,
                elapsedTimeSeconds: 0,
                caloriesBurned: 0,
                heartRate: 115,
                isPaused: false
            )
            
            do {
                let activity = try Activity<CalyxoActivityAttributes>.request(
                    attributes: attributes,
                    content: .init(state: initialState, staleDate: nil)
                )
                print("[CalyxoLiveActivityBridge] Started Live Activity with ID: \(activity.id)")
                return activity.id
            } catch {
                print("[CalyxoLiveActivityBridge] Error starting Live Activity: \(error.localizedDescription)")
                return nil
            }
        } else {
            print("[CalyxoLiveActivityBridge] ActivityKit is only available on iOS 16.1+")
            return nil
        }
    }
    
    @objc public func updateActivity(
        id: String,
        exerciseName: String,
        setNumber: Int,
        reps: Int,
        restSeconds: Int,
        elapsedTime: Int,
        calories: Int,
        heartRate: Int,
        isPaused: Bool
    ) {
        if #available(iOS 16.1, *) {
            Task {
                for activity in Activity<CalyxoActivityAttributes>.activities where activity.id == id {
                    let updatedState = CalyxoActivityAttributes.ContentState(
                        workoutName: activity.content.state.workoutName,
                        exerciseName: exerciseName,
                        currentSet: setNumber,
                        currentReps: reps,
                        restSecondsRemaining: restSeconds,
                        elapsedTimeSeconds: elapsedTime,
                        caloriesBurned: calories,
                        heartRate: heartRate,
                        isPaused: isPaused
                    )
                    await activity.update(.init(state: updatedState, staleDate: nil))
                    print("[CalyxoLiveActivityBridge] Updated Live Activity: \(id)")
                }
            }
        }
    }
    
    @objc public func endActivity(id: String) {
        if #available(iOS 16.1, *) {
            Task {
                for activity in Activity<CalyxoActivityAttributes>.activities where activity.id == id {
                    await activity.end(nil, dismissalPolicy: .immediate)
                    print("[CalyxoLiveActivityBridge] Ended Live Activity: \(id)")
                }
            }
        }
    }
}
