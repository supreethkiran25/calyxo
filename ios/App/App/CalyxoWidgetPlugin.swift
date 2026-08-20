import Capacitor
import WidgetKit
import AVFoundation

/// Capacitor Plugin bridging JavaScript state to shared App Group UserDefaults & WidgetKit timelines.
/// JS calls: Capacitor.Plugins.CalyxoWidget.syncWidgetData(...)
@objc(CalyxoWidgetPlugin)
public class CalyxoWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalyxoWidgetPlugin"
    public let jsName = "CalyxoWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "syncWidgetData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearWidgetData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reloadWidgets", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isMusicPlaying", returnType: CAPPluginReturnPromise)
    ]

    @objc func syncWidgetData(_ call: CAPPluginCall) {
        let suiteName = "group.com.supreethkiran.calyxo"
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            call.reject("Failed to access App Group UserDefaults: \(suiteName)")
            return
        }

        if let calories = call.getInt("calories") {
            defaults.set(calories, forKey: "widget_calories")
        }
        if let calorieGoal = call.getInt("calorieGoal") {
            defaults.set(calorieGoal, forKey: "widget_calorie_goal")
        }
        if let water = call.getInt("water") {
            defaults.set(water, forKey: "widget_water")
        }
        if let waterGoal = call.getInt("waterGoal") {
            defaults.set(waterGoal, forKey: "widget_water_goal")
        }
        if let protein = call.getInt("protein") {
            defaults.set(protein, forKey: "widget_protein")
        }
        if let proteinGoal = call.getInt("proteinGoal") {
            defaults.set(proteinGoal, forKey: "widget_protein_goal")
        }
        if let carbs = call.getInt("carbs") {
            defaults.set(carbs, forKey: "widget_carbs")
        }
        if let fat = call.getInt("fat") {
            defaults.set(fat, forKey: "widget_fat")
        }
        if let steps = call.getInt("steps") {
            defaults.set(steps, forKey: "widget_steps")
        }
        if let streak = call.getInt("streak") {
            defaults.set(streak, forKey: "widget_streak")
        }
        if let activeWorkoutName = call.getString("activeWorkoutName") {
            defaults.set(activeWorkoutName, forKey: "widget_active_workout")
        }

        defaults.synchronize()

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve(["success": true])
    }

    @objc func clearWidgetData(_ call: CAPPluginCall) {
        let suiteName = "group.com.supreethkiran.calyxo"
        if let defaults = UserDefaults(suiteName: suiteName) {
            defaults.removeObject(forKey: "widget_calories")
            defaults.removeObject(forKey: "widget_calorie_goal")
            defaults.removeObject(forKey: "widget_water")
            defaults.removeObject(forKey: "widget_water_goal")
            defaults.removeObject(forKey: "widget_protein")
            defaults.removeObject(forKey: "widget_protein_goal")
            defaults.removeObject(forKey: "widget_carbs")
            defaults.removeObject(forKey: "widget_fat")
            defaults.removeObject(forKey: "widget_steps")
            defaults.removeObject(forKey: "widget_streak")
            defaults.removeObject(forKey: "widget_active_workout")
            defaults.synchronize()
        }

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve(["success": true])
    }

    @objc func reloadWidgets(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve(["success": true])
    }

    @objc func isMusicPlaying(_ call: CAPPluginCall) {
        let isPlaying = AVAudioSession.sharedInstance().isOtherAudioPlaying
        call.resolve(["isPlaying": isPlaying])
    }
}
