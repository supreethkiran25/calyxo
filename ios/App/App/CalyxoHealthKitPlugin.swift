import Capacitor
import HealthKit

/// Production-grade Apple HealthKit Capacitor Plugin.
/// Performs real HKStatisticsQuery, HKSampleQuery, and authorization calls.
/// Logs all operations with [CALYXO-HEALTH].
@objc(CalyxoHealthKitPlugin)
public class CalyxoHealthKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalyxoHealthKitPlugin"
    public let jsName = "CalyxoHealthKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryTodayMetrics", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryRecentWorkouts", returnType: CAPPluginReturnPromise)
    ]

    private let healthStore = AppDelegate.healthStore

    @objc func isAvailable(_ call: CAPPluginCall) {
        let available = HKHealthStore.isHealthDataAvailable()
        print("[CALYXO-HEALTH] isAvailable = \(available)")
        call.resolve(["available": available])
    }

    @objc func getStatus(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve([
                "available": false,
                "connected": false,
                "status": "unavailable"
            ])
            return
        }

        let workoutType = HKObjectType.workoutType()
        let writeStatus = healthStore.authorizationStatus(for: workoutType)
        let isAuthorized = (writeStatus == .sharingAuthorized)

        print("[CALYXO-HEALTH] getStatus: available=true, sharingAuthorized=\(isAuthorized)")
        call.resolve([
            "available": true,
            "connected": isAuthorized,
            "status": isAuthorized ? "authorized" : "not_determined"
        ])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        print("[CALYXO-HEALTH] requestAuthorization initiated from JS...")
        AppDelegate.requestHealthKitAuthorization { success, error in
            if let error = error {
                print("[CALYXO-HEALTH] Authorization error: \(error.localizedDescription)")
                call.reject(error.localizedDescription, nil, error)
            } else {
                print("[CALYXO-HEALTH] Authorization completed with success: \(success)")
                call.resolve([
                    "authorized": success,
                    "timestamp": ISO8601DateFormatter().string(from: Date())
                ])
            }
        }
    }

    @objc func queryTodayMetrics(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available on this device.")
            return
        }

        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

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

        // 1. Steps
        if let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) {
            group.enter()
            let stepQuery = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let steps = Int(sum.doubleValue(for: HKUnit.count()))
                    result["steps"] = steps
                    print("[CALYXO-HEALTH] Step query returned: \(steps)")
                }
                group.leave()
            }
            healthStore.execute(stepQuery)
        }

        // 2. Active Energy Burned (Calories)
        if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            group.enter()
            let energyQuery = HKStatisticsQuery(quantityType: energyType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let kcal = Int(sum.doubleValue(for: HKUnit.kilocalorie()))
                    result["activeCalories"] = kcal
                    print("[CALYXO-HEALTH] Active calories query returned: \(kcal)")
                }
                group.leave()
            }
            healthStore.execute(energyQuery)
        }

        // 3. Distance Walking/Running
        if let distType = HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning) {
            group.enter()
            let distQuery = HKStatisticsQuery(quantityType: distType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let km = (sum.doubleValue(for: HKUnit.meter()) / 1000.0)
                    result["distanceKm"] = (km * 100).rounded() / 100
                    print("[CALYXO-HEALTH] Distance query returned: \(km) km")
                }
                group.leave()
            }
            healthStore.execute(distQuery)
        }

        // 4. Latest Heart Rate
        if let hrType = HKQuantityType.quantityType(forIdentifier: .heartRate) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let hrQuery = HKSampleQuery(sampleType: hrType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    let bpm = Int(sample.quantity.doubleValue(for: HKUnit(from: "count/min")))
                    result["heartRateBpm"] = bpm
                    print("[CALYXO-HEALTH] Latest Heart Rate query returned: \(bpm) bpm")
                }
                group.leave()
            }
            healthStore.execute(hrQuery)
        }

        // 5. Resting Heart Rate
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

        // 6. Weight (Body Mass)
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

        // Complete all async HealthKit queries
        group.notify(queue: .main) {
            print("[CALYXO-HEALTH] Today metrics summary loaded: \(result)")
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
                return [
                    "id": w.uuid.uuidString,
                    "type": self.formatWorkoutActivityType(w.workoutActivityType),
                    "title": self.formatWorkoutActivityType(w.workoutActivityType),
                    "durationMin": durationMin,
                    "caloriesBurned": Int(cals),
                    "startDate": formatter.string(from: w.startDate),
                    "endDate": formatter.string(from: w.endDate),
                    "source": w.sourceRevision.source.name
                ]
            }
            print("[CALYXO-HEALTH] Found \(mapped.count) real workouts in HealthKit.")
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
}
