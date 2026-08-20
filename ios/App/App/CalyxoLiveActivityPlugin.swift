import Capacitor
import ActivityKit

/// Capacitor Plugin bridging JavaScript calls to iOS Dynamic Island & Lock Screen Live Activities
/// JS calls: Capacitor.Plugins.CalyxoLiveActivity.startActivity(...)
@objc(CalyxoLiveActivityPlugin)
public class CalyxoLiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalyxoLiveActivityPlugin"
    public let jsName = "CalyxoLiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endActivity", returnType: CAPPluginReturnPromise)
    ]

    @objc func isAvailable(_ call: CAPPluginCall) {
        let enabled = CalyxoLiveActivityBridge.shared.areActivitiesEnabled()
        call.resolve([
            "available": true,
            "enabled": enabled
        ])
    }

    @objc func startActivity(_ call: CAPPluginCall) {
        let title = call.getString("title") ?? "Calyxo Workout"
        let workoutName = call.getString("workoutName") ?? "Workout Session"
        let exerciseName = call.getString("exerciseName") ?? "Exercise"
        let currentSet = call.getInt("currentSet") ?? 1
        let totalSets = call.getInt("totalSets") ?? 3
        let currentReps = call.getInt("currentReps") ?? 10
        let isResting = call.getBool("isResting") ?? false
        let restDurationSeconds = call.getInt("restDurationSeconds") ?? 0
        let caloriesBurned = call.getInt("caloriesBurned") ?? 0
        let heartRate = call.getInt("heartRate") ?? 0

        print("[CALYXO-LIVE] Capacitor plugin received startActivity for \(workoutName) - \(exerciseName)")
        let res = CalyxoLiveActivityBridge.shared.startActivity(
            title: title,
            workoutName: workoutName,
            exerciseName: exerciseName,
            currentSet: currentSet,
            totalSets: totalSets,
            currentReps: currentReps,
            isResting: isResting,
            restDurationSeconds: restDurationSeconds,
            caloriesBurned: caloriesBurned,
            heartRate: heartRate
        )

        if let success = res["success"] as? Bool, success, let activityId = res["activityId"] as? String {
            call.resolve([
                "success": true,
                "activityId": activityId
            ])
        } else {
            let errMsg = (res["error"] as? String) ?? "Failed to start Live Activity."
            call.reject(errMsg)
        }
    }

    @objc func updateActivity(_ call: CAPPluginCall) {
        let id = call.getString("id") ?? ""
        let exerciseName = call.getString("exerciseName") ?? "Exercise"
        let currentSet = call.getInt("currentSet") ?? 1
        let totalSets = call.getInt("totalSets") ?? 3
        let currentReps = call.getInt("currentReps") ?? 10
        let isResting = call.getBool("isResting") ?? false
        let restDurationSeconds = call.getInt("restDurationSeconds") ?? 0
        let calories = call.getInt("calories") ?? 0
        let heartRate = call.getInt("heartRate") ?? 0
        let isPaused = call.getBool("isPaused") ?? false

        CalyxoLiveActivityBridge.shared.updateActivity(
            id: id,
            exerciseName: exerciseName,
            currentSet: currentSet,
            totalSets: totalSets,
            currentReps: currentReps,
            isResting: isResting,
            restDurationSeconds: restDurationSeconds,
            caloriesBurned: calories,
            heartRate: heartRate,
            isPaused: isPaused
        )

        call.resolve(["success": true])
    }

    @objc func endActivity(_ call: CAPPluginCall) {
        let id = call.getString("id") ?? ""
        CalyxoLiveActivityBridge.shared.endActivity(id: id)
        call.resolve(["success": true])
    }
}
