import Foundation
import Capacitor
import HealthKit
import CoreMotion
import WidgetKit
import AppTrackingTransparency

@objc(CalyxoHealthKitPlugin)
public class CalyxoHealthKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalyxoHealthKitPlugin"
    public let jsName = "CalyxoHealthKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkAuthorizationStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestMotionPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestTrackingPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openHealthSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openBluetoothSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryTodayMetrics", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryRecentWorkouts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "activateHealthKitSource", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveWorkout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveWeight", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveWater", returnType: CAPPluginReturnPromise)
    ]

    private let healthStore = HKHealthStore()
    private let pedometer = CMPedometer()

    @objc func isAvailable(_ call: CAPPluginCall) {
        let available = HKHealthStore.isHealthDataAvailable()
        call.resolve([
            "available": available,
            "hasPedometer": CMPedometer.isStepCountingAvailable()
        ])
    }

    @objc func checkAuthorizationStatus(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve([
                "authorized": false,
                "available": false,
                "status": "NOT_AVAILABLE",
                "statusString": "NOT_AVAILABLE"
            ])
            return
        }
        if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            let status = healthStore.authorizationStatus(for: energyType)
            let isAuth = (status == .sharingAuthorized)
            let statusString: String
            switch status {
            case .notDetermined:
                statusString = "NOT_DETERMINED"
            case .sharingDenied:
                statusString = "DENIED"
            case .sharingAuthorized:
                statusString = "AUTHORIZED"
            @unknown default:
                statusString = "NOT_DETERMINED"
            }
            call.resolve([
                "authorized": isAuth,
                "status": statusString,
                "statusString": statusString,
                "rawStatus": status.rawValue,
                "available": true
            ])
        } else {
            call.resolve([
                "authorized": false,
                "available": false,
                "status": "NOT_AVAILABLE",
                "statusString": "NOT_AVAILABLE"
            ])
        }
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve([
                "authorized": false,
                "available": false,
                "status": "NOT_AVAILABLE",
                "statusString": "NOT_AVAILABLE"
            ])
            return
        }

        AppDelegate.requestHealthKitAuthorization { [weak self] success, error in
            guard let self = self else { return }
            if let error = error {
                print("[CALYXO-HEALTH] Authorization error: \(error.localizedDescription)")
                call.reject(error.localizedDescription)
                return
            }
            
            // Explicitly re-query native authorization status after prompt completion
            var statusString = "NOT_DETERMINED"
            var isActuallyAuthorized = false
            
            if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
                let status = self.healthStore.authorizationStatus(for: energyType)
                switch status {
                case .sharingAuthorized:
                    isActuallyAuthorized = true
                    statusString = "AUTHORIZED"
                case .sharingDenied:
                    isActuallyAuthorized = false
                    statusString = "DENIED"
                case .notDetermined:
                    isActuallyAuthorized = false
                    statusString = "NOT_DETERMINED"
                @unknown default:
                    isActuallyAuthorized = false
                    statusString = "NOT_DETERMINED"
                }
            }
            
            call.resolve([
                "authorized": isActuallyAuthorized,
                "status": statusString,
                "statusString": statusString,
                "available": true,
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ])
        }
    }

    @objc func requestMotionPermission(_ call: CAPPluginCall) {
        if CMPedometer.isStepCountingAvailable() {
            let now = Date()
            pedometer.queryPedometerData(from: now.addingTimeInterval(-60), to: now) { data, error in
                call.resolve(["authorized": error == nil])
            }
        } else {
            call.resolve(["authorized": false])
        }
    }

    @objc func requestTrackingPermission(_ call: CAPPluginCall) {
        if #available(iOS 14, *) {
            ATTrackingManager.requestTrackingAuthorization { status in
                call.resolve([
                    "status": status.rawValue,
                    "authorized": status == .authorized
                ])
            }
        } else {
            call.resolve(["authorized": true])
        }
    }

    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                if UIApplication.shared.canOpenURL(settingsUrl) {
                    UIApplication.shared.open(settingsUrl, options: [:]) { success in
                        call.resolve(["opened": success])
                    }
                    return
                }
            }
            call.resolve(["opened": false])
        }
    }

    @objc func openHealthSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let candidateUrls = [
                "App-Prefs:root=HEALTH",
                "App-Prefs:root=Privacy&path=HEALTH",
                "prefs:root=HEALTH",
                "prefs:root=Privacy&path=HEALTH",
                UIApplication.openSettingsURLString
            ]

            func tryOpenUrl(at index: Int) {
                guard index < candidateUrls.count else {
                    if let healthUrl = URL(string: "x-apple-health://") {
                        UIApplication.shared.open(healthUrl, options: [:], completionHandler: nil)
                    }
                    call.resolve(["opened": false])
                    return
                }

                let urlString = candidateUrls[index]
                if let url = URL(string: urlString) {
                    UIApplication.shared.open(url, options: [:]) { success in
                        if success {
                            print("[CALYXO-HEALTH] ✅ Opened health settings via: \(urlString)")
                            call.resolve(["opened": true, "target": urlString])
                        } else {
                            tryOpenUrl(at: index + 1)
                        }
                    }
                } else {
                    tryOpenUrl(at: index + 1)
                }
            }

            tryOpenUrl(at: 0)
        }
    }

    @objc func openBluetoothSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let urls = [
                "App-Prefs:root=Bluetooth",
                "prefs:root=Bluetooth",
                UIApplication.openSettingsURLString
            ]
            for urlStr in urls {
                if let url = URL(string: urlStr), UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url, options: [:]) { success in
                        if success {
                            call.resolve(["opened": true])
                            return
                        }
                    }
                }
            }
            if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(settingsUrl, options: [:]) { success in
                    call.resolve(["opened": success])
                }
            } else {
                call.resolve(["opened": false])
            }
        }
    }

    @objc func queryTodayMetrics(_ call: CAPPluginCall) {
        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)

        var result: [String: Any] = [
            "steps": 0,
            "activeCalories": 0,
            "distanceKm": 0.0,
            "heartRateBpm": 0,
            "restingHeartRateBpm": 0,
            "sleepHours": 0.0,
            "weightKg": 0.0,
            "bodyFatPct": 0.0,
            "vo2Max": 0.0,
            "timestamp": Date().timeIntervalSince1970 * 1000
        ]

        let group = DispatchGroup()

        // 1. Live CMPedometer Step & Distance Query (Instantaneous hardware-accurate count)
        if CMPedometer.isStepCountingAvailable() {
            group.enter()
            pedometer.queryPedometerData(from: startOfDay, to: now) { data, error in
                if let data = data {
                    let pedSteps = data.numberOfSteps.intValue
                    if pedSteps > 0 {
                        result["steps"] = pedSteps
                        if let dist = data.distance?.doubleValue {
                            result["distanceKm"] = (dist / 1000.0 * 100).rounded() / 100
                        }
                        print("[CALYXO-HEALTH] CoreMotion Pedometer: \(pedSteps) steps, \(result["distanceKm"] ?? 0) km")
                    }
                }
                group.leave()
            }
        }

        // If HealthKit is not available, return pedometer results directly
        guard HKHealthStore.isHealthDataAvailable() else {
            group.notify(queue: .main) {
                call.resolve(result)
            }
            return
        }

        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

        // 2. HealthKit Cumulative Steps (Takes max of HealthKit and CoreMotion)
        if let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) {
            group.enter()
            let stepQuery = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let hkSteps = Int(sum.doubleValue(for: HKUnit.count()))
                    let currentSteps = result["steps"] as? Int ?? 0
                    result["steps"] = max(hkSteps, currentSteps)
                    print("[CALYXO-HEALTH] HealthKit Step sum: \(hkSteps) (Final: \(result["steps"] ?? 0))")
                }
                group.leave()
            }
            healthStore.execute(stepQuery)
        }

        // 3. Active Energy Burned (Calories)
        if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            group.enter()
            let energyQuery = HKStatisticsQuery(quantityType: energyType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let kcal = Int(sum.doubleValue(for: HKUnit.kilocalorie()))
                    result["activeCalories"] = kcal
                    print("[CALYXO-HEALTH] Active calories: \(kcal) kcal")
                }
                group.leave()
            }
            healthStore.execute(energyQuery)
        }

        // 4. Distance Walking/Running (If not already set by pedometer)
        if let distType = HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning) {
            group.enter()
            let distQuery = HKStatisticsQuery(quantityType: distType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let hkKm = (sum.doubleValue(for: HKUnit.meter()) / 1000.0 * 100).rounded() / 100
                    let currentKm = result["distanceKm"] as? Double ?? 0.0
                    result["distanceKm"] = max(hkKm, currentKm)
                }
                group.leave()
            }
            healthStore.execute(distQuery)
        }

        // 4b. Cycling Distance (Garmin Edge / Garmin Watch / Strava Cycling)
        if let cyclingType = HKQuantityType.quantityType(forIdentifier: .distanceCycling) {
            group.enter()
            let cyclingQuery = HKStatisticsQuery(quantityType: cyclingType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let cyclingKm = (sum.doubleValue(for: HKUnit.meter()) / 1000.0 * 100).rounded() / 100
                    let currentKm = result["distanceKm"] as? Double ?? 0.0
                    result["distanceKm"] = ((currentKm + cyclingKm) * 100).rounded() / 100
                    result["distanceCyclingKm"] = cyclingKm
                }
                group.leave()
            }
            healthStore.execute(cyclingQuery)
        }

        // 5. Latest Heart Rate (BPM)
        if let hrType = HKQuantityType.quantityType(forIdentifier: .heartRate) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let hrQuery = HKSampleQuery(sampleType: hrType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    let bpm = Int(sample.quantity.doubleValue(for: HKUnit(from: "count/min")))
                    result["heartRateBpm"] = bpm
                    print("[CALYXO-HEALTH] Heart Rate: \(bpm) bpm")
                }
                group.leave()
            }
            healthStore.execute(hrQuery)
        }

        // 6. Resting Heart Rate
        if let rhrType = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let rhrQuery = HKSampleQuery(sampleType: rhrType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    let bpm = Int(sample.quantity.doubleValue(for: HKUnit(from: "count/min")))
                    result["restingHeartRateBpm"] = bpm
                }
                group.leave()
            }
            healthStore.execute(rhrQuery)
        }

        // 7. Sleep Analysis (Apple Watch & Garmin Connect Sleep Logs for Last 24 Hours)
        if let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) {
            group.enter()
            let sleepStart = calendar.date(byAdding: .hour, value: -24, to: now) ?? startOfDay
            let sleepPredicate = HKQuery.predicateForSamples(withStart: sleepStart, end: now, options: .strictStartDate)
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
            let sleepQuery = HKSampleQuery(sampleType: sleepType, predicate: sleepPredicate, limit: 100, sortDescriptors: [sort]) { _, samples, _ in
                if let categorySamples = samples as? [HKCategorySample] {
                    var totalSleepSec: TimeInterval = 0
                    for sample in categorySamples {
                        if #available(iOS 16.0, *) {
                            if sample.value == HKCategoryValueSleepAnalysis.asleepCore.rawValue ||
                               sample.value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue ||
                               sample.value == HKCategoryValueSleepAnalysis.asleepREM.rawValue ||
                               sample.value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue {
                                totalSleepSec += sample.endDate.timeIntervalSince(sample.startDate)
                            }
                        } else {
                            if sample.value == HKCategoryValueSleepAnalysis.asleep.rawValue {
                                totalSleepSec += sample.endDate.timeIntervalSince(sample.startDate)
                            }
                        }
                    }
                    let hours = (totalSleepSec / 3600.0 * 10).rounded() / 10
                    if hours > 0 {
                        result["sleepHours"] = hours
                        print("[CALYXO-HEALTH] Apple Health Sleep: \(hours) hours")
                    }
                }
                group.leave()
            }
            healthStore.execute(sleepQuery)
        }

        // 8. Body Weight (Body Mass)
        if let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let weightQuery = HKSampleQuery(sampleType: weightType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    let kg = (sample.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo)) * 10).rounded() / 10
                    result["weightKg"] = kg
                }
                group.leave()
            }
            healthStore.execute(weightQuery)
        }

        // 9. Body Fat Percentage
        if let bodyFatType = HKQuantityType.quantityType(forIdentifier: .bodyFatPercentage) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let bodyFatQuery = HKSampleQuery(sampleType: bodyFatType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    let pct = (sample.quantity.doubleValue(for: HKUnit.percent()) * 1000).rounded() / 10
                    result["bodyFatPct"] = pct
                }
                group.leave()
            }
            healthStore.execute(bodyFatQuery)
        }

        // 10. VO2 Max (Garmin / Apple Watch Aerobic Capacity)
        if let vo2Type = HKQuantityType.quantityType(forIdentifier: .vo2Max) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let vo2Query = HKSampleQuery(sampleType: vo2Type, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    let vo2 = (sample.quantity.doubleValue(for: HKUnit(from: "ml/kg*min")) * 10).rounded() / 10
                    result["vo2Max"] = vo2
                }
                group.leave()
            }
            healthStore.execute(vo2Query)
        }

        // 11. Heart Rate Variability (SDNN)
        if let hrvType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let hrvQuery = HKSampleQuery(sampleType: hrvType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    let hrvMs = (sample.quantity.doubleValue(for: HKUnit.secondUnit(with: .milli)) * 10).rounded() / 10
                    result["hrvMs"] = hrvMs
                }
                group.leave()
            }
            healthStore.execute(hrvQuery)
        }

        // Final Resolution & Real-Time Widget Sync
        group.notify(queue: .main) {
            let suiteName = "group.com.supreethkiran.calyxo"
            if let defaults = UserDefaults(suiteName: suiteName) {
                if let steps = result["steps"] as? Int, steps > 0 {
                    defaults.set(steps, forKey: "widget_steps")
                }
                if let activeCals = result["activeCalories"] as? Int, activeCals > 0 {
                    defaults.set(activeCals, forKey: "widget_calories")
                }
                defaults.synchronize()
                if #available(iOS 14.0, *) {
                    WidgetCenter.shared.reloadAllTimelines()
                }
            }
            print("[CALYXO-HEALTH] Today metrics summary loaded and synced to widget: \(result)")
            call.resolve(result)
        }
    }

    @objc func queryRecentWorkouts(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["workouts": []])
            return
        }

        let workoutType = HKObjectType.workoutType()
        let sevenDaysAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date().addingTimeInterval(-7*86400)
        let predicate = HKQuery.predicateForSamples(withStart: sevenDaysAgo, end: Date(), options: .strictStartDate)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let query = HKSampleQuery(sampleType: workoutType, predicate: predicate, limit: 20, sortDescriptors: [sort]) { _, samples, error in
            guard let workouts = samples as? [HKWorkout], error == nil else {
                print("[CALYXO-HEALTH] Workout query empty or error: \(error?.localizedDescription ?? "none")")
                call.resolve(["workouts": []])
                return
            }

            let formatter = ISO8601DateFormatter()
            let mapped = workouts.map { w -> [String: Any] in
                let durationMin = Int(w.duration / 60)
                let cals = w.totalEnergyBurned?.doubleValue(for: .kilocalorie()) ?? 0
                var distanceKm = 0.0
                if let dist = w.totalDistance?.doubleValue(for: .meter()) {
                    distanceKm = (dist / 1000.0 * 100).rounded() / 100
                }
                let sourceName = w.sourceRevision.source.name
                let isGarmin = sourceName.localizedCaseInsensitiveContains("garmin")

                return [
                    "id": w.uuid.uuidString,
                    "type": self.formatWorkoutActivityType(w.workoutActivityType),
                    "title": self.formatWorkoutActivityType(w.workoutActivityType),
                    "durationMin": durationMin,
                    "caloriesBurned": Int(cals),
                    "distanceKm": distanceKm,
                    "startDate": formatter.string(from: w.startDate),
                    "endDate": formatter.string(from: w.endDate),
                    "source": sourceName,
                    "isGarmin": isGarmin
                ]
            }
            print("[CALYXO-HEALTH] Loaded \(mapped.count) workouts from HealthKit.")
            call.resolve(["workouts": mapped])
        }

        healthStore.execute(query)
    }

    private func formatWorkoutActivityType(_ type: HKWorkoutActivityType) -> String {
        switch type {
        case .traditionalStrengthTraining: return "Strength Training"
        case .functionalStrengthTraining: return "Functional Training"
        case .running: return "Running"
        case .walking: return "Walking"
        case .cycling: return "Cycling"
        case .highIntensityIntervalTraining: return "HIIT Workout"
        case .crossTraining: return "Cross Training"
        case .yoga: return "Yoga"
        case .swimming: return "Swimming"
        default: return "Workout Session"
        }
    }

    private func mapStringToWorkoutType(_ str: String) -> HKWorkoutActivityType {
        let lower = str.lowercased()
        if lower.contains("run") { return .running }
        if lower.contains("walk") { return .walking }
        if lower.contains("cycl") || lower.contains("bike") { return .cycling }
        if lower.contains("hiit") || lower.contains("interval") { return .highIntensityIntervalTraining }
        if lower.contains("yoga") { return .yoga }
        if lower.contains("swim") { return .swimming }
        if lower.contains("cross") { return .crossTraining }
        if lower.contains("strength") || lower.contains("gym") || lower.contains("weight") { return .traditionalStrengthTraining }
        return .other
    }

    @objc func activateHealthKitSource(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["activated": false])
            return
        }

        let endDate = Date()
        let startDate = endDate.addingTimeInterval(-60)
        let energy = HKQuantity(unit: .kilocalorie(), doubleValue: 1.0)

        let workout = HKWorkout(
            activityType: .other,
            start: startDate,
            end: endDate,
            duration: 60,
            totalEnergyBurned: energy,
            totalDistance: nil,
            metadata: [
                HKMetadataKeySyncIdentifier: "calyxo_init_\(Int(Date().timeIntervalSince1970))",
                HKMetadataKeySyncVersion: 1
            ]
        )

        healthStore.save(workout) { success, error in
            if success {
                print("[CALYXO-HEALTH] ✅ Initial sync sample written — Calyxo is now ACTIVE in Apple Health Data Sources!")
            }
            call.resolve(["activated": success, "error": error?.localizedDescription ?? ""])
        }
    }

    @objc func saveWorkout(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available")
            return
        }

        let calories = call.getDouble("calories") ?? 0.0
        let durationMinutes = call.getDouble("durationMinutes") ?? 30.0
        let typeStr = call.getString("type") ?? "traditionalStrengthTraining"
        let activityType = self.mapStringToWorkoutType(typeStr)

        let endDate = Date()
        let startDate = endDate.addingTimeInterval(-durationMinutes * 60)

        var energyQuantity: HKQuantity? = nil
        if calories > 0 {
            energyQuantity = HKQuantity(unit: .kilocalorie(), doubleValue: calories)
        }

        let workout = HKWorkout(
            activityType: activityType,
            start: startDate,
            end: endDate,
            duration: durationMinutes * 60,
            totalEnergyBurned: energyQuantity,
            totalDistance: nil,
            metadata: [
                HKMetadataKeySyncIdentifier: UUID().uuidString,
                HKMetadataKeySyncVersion: 1
            ]
        )

        healthStore.save(workout) { success, error in
            if let error = error {
                print("[CALYXO-HEALTH] Save workout error: \(error.localizedDescription)")
                call.reject(error.localizedDescription)
            } else {
                print("[CALYXO-HEALTH] ✅ Workout saved to HealthKit successfully! Calyxo is now an Active Data Source.")
                call.resolve(["saved": true, "id": workout.uuid.uuidString])
            }
        }
    }

    @objc func saveWeight(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available")
            return
        }

        guard let weightKg = call.getDouble("weightKg"), weightKg > 0 else {
            call.reject("Invalid weight in kg")
            return
        }

        guard let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) else {
            call.reject("Body mass type unavailable")
            return
        }

        let quantity = HKQuantity(unit: .gramUnit(with: .kilo), doubleValue: weightKg)
        let sample = HKQuantitySample(type: weightType, quantity: quantity, start: Date(), end: Date())

        healthStore.save(sample) { success, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                print("[CALYXO-HEALTH] ✅ Weight saved to HealthKit! Calyxo is now an Active Data Source.")
                call.resolve(["saved": true])
            }
        }
    }

    @objc func saveWater(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available")
            return
        }

        guard let ml = call.getDouble("milliliters"), ml > 0 else {
            call.reject("Invalid water amount in ml")
            return
        }

        guard let waterType = HKQuantityType.quantityType(forIdentifier: .dietaryWater) else {
            call.reject("Dietary water type unavailable")
            return
        }

        let quantity = HKQuantity(unit: .literUnit(with: .milli), doubleValue: ml)
        let sample = HKQuantitySample(type: waterType, quantity: quantity, start: Date(), end: Date())

        healthStore.save(sample) { success, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                print("[CALYXO-HEALTH] ✅ Hydration saved to HealthKit! Calyxo is now an Active Data Source.")
                call.resolve(["saved": true])
            }
        }
    }
}
