import Foundation
import ActivityKit

// Shared ActivityAttributes model — compiled into BOTH the main App target
// AND the CalyxoWidgets extension target.
// This is the single source of truth for the Live Activity data contract.

@available(iOS 16.1, *)
public struct CalyxoActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var workoutName: String
        public var exerciseName: String
        public var currentSet: Int
        public var totalSets: Int
        public var currentReps: Int
        public var isResting: Bool
        public var restStartDate: Date?
        public var restEndDate: Date?
        public var workoutStartDate: Date
        public var caloriesBurned: Int
        public var heartRate: Int
        public var isPaused: Bool

        public init(
            workoutName: String,
            exerciseName: String = "",
            currentSet: Int = 1,
            totalSets: Int = 3,
            currentReps: Int = 10,
            isResting: Bool = false,
            restStartDate: Date? = nil,
            restEndDate: Date? = nil,
            workoutStartDate: Date = Date(),
            caloriesBurned: Int = 0,
            heartRate: Int = 0,
            isPaused: Bool = false
        ) {
            self.workoutName = workoutName
            self.exerciseName = exerciseName
            self.currentSet = currentSet
            self.totalSets = totalSets
            self.currentReps = currentReps
            self.isResting = isResting
            self.restStartDate = restStartDate
            self.restEndDate = restEndDate
            self.workoutStartDate = workoutStartDate
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
