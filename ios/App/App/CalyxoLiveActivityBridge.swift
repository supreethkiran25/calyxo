import Foundation
import ActivityKit
import SwiftUI

// ActivityAttributes defining dynamic state for iOS Dynamic Island & Lock Screen
@available(iOS 16.1, *)
public struct CalyxoActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var workoutName: String
        public var elapsedTimeSeconds: Int
        public var caloriesBurned: Int
        public var heartRate: Int
        public var isPaused: Bool
        
        public init(workoutName: String, elapsedTimeSeconds: Int, caloriesBurned: Int, heartRate: Int, isPaused: Bool) {
            self.workoutName = workoutName
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
    
    @objc public func startActivity(title: String, workoutName: String) -> String? {
        if #available(iOS 16.1, *) {
            guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                print("[CalyxoLiveActivityBridge] Live Activities are disabled by user settings.")
                return nil
            }
            
            let attributes = CalyxoActivityAttributes(title: title)
            let initialState = CalyxoActivityAttributes.ContentState(
                workoutName: workoutName,
                elapsedTimeSeconds: 0,
                caloriesBurned: 0,
                heartRate: 110,
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
    
    @objc public func updateActivity(id: String, elapsedTime: Int, calories: Int, heartRate: Int, isPaused: Bool) {
        if #available(iOS 16.1, *) {
            Task {
                for activity in Activity<CalyxoActivityAttributes>.activities where activity.id == id {
                    let updatedState = CalyxoActivityAttributes.ContentState(
                        workoutName: activity.content.state.workoutName,
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
