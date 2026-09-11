//
//  CalyxoNativeHealthKitManager.swift
//  Calyxo Native Foundation
//
//  Production-grade native Apple HealthKit & CoreMotion manager.
//  Zero fake data. Enforces strict permission classification, background delivery,
//  and verified backend synchronization.
//

import Foundation
import HealthKit
import CoreMotion
import WidgetKit

public final class CalyxoNativeHealthKitManager: ObservableObject {
    public static let shared = CalyxoNativeHealthKitManager()
    
    public enum HealthConnectionState: String, Codable {
        case notDetermined = "NOT_DETERMINED"
        case requestingAuthorization = "REQUESTING_AUTHORIZATION"
        case authorized = "AUTHORIZED"
        case denied = "DENIED"
        case restricted = "RESTRICTED"
        case unavailable = "UNAVAILABLE"
        case connectedNoData = "CONNECTED_NO_DATA"
        case connectedWithData = "CONNECTED_WITH_DATA"
        case syncing = "SYNCING"
        case synced = "SYNCED"
        case syncFailed = "SYNC_FAILED"
    }
    
    public struct TodayHealthSnapshot: Codable {
        public var steps: Int
        public var distanceKm: Double
        public var activeCalories: Int
        public var heartRateBpm: Int
        public var restingHeartRateBpm: Int
        public var sleepHours: Double
        public var weightKg: Double
        public var vo2Max: Double
        public var connectionState: HealthConnectionState
        public var lastSyncedAt: Date?
        public var lastUpdated: Date
        
        public static var zero: TodayHealthSnapshot {
            return TodayHealthSnapshot(
                steps: 0,
                distanceKm: 0.0,
                activeCalories: 0,
                heartRateBpm: 0,
                restingHeartRateBpm: 0,
                sleepHours: 0.0,
                weightKg: 0.0,
                vo2Max: 0.0,
                connectionState: .notDetermined,
                lastSyncedAt: nil,
                lastUpdated: Date()
            )
        }
    }
    
    private let healthStore = HKHealthStore()
    private let pedometer = CMPedometer()
    
    @Published public private(set) var currentSnapshot: TodayHealthSnapshot = .zero
    @Published public private(set) var isAuthorized: Bool = false
    @Published public private(set) var connectionState: HealthConnectionState = .notDetermined
    @Published public private(set) var lastSyncTimestamp: Date? = nil
    
    private let authService = CalyxoNativeAuthService.shared
    
    private init() {
        checkAvailability()
    }
    
    // MARK: - Availability Check
    public func checkAvailability() {
        guard HKHealthStore.isHealthDataAvailable() else {
            self.connectionState = .unavailable
            return
        }
        // If not determined yet, maintain .notDetermined until user initiates request
        if self.connectionState != .authorized && self.connectionState != .synced && self.connectionState != .connectedWithData {
            self.connectionState = .notDetermined
        }
    }
    
    // MARK: - Request Authorization
    public func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            self.connectionState = .unavailable
            completion(false, NSError(domain: "CalyxoHealth", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit not available on this device"]))
            return
        }
        
        self.connectionState = .requestingAuthorization
        
        var readTypes: Set<HKObjectType> = []
        var shareTypes: Set<HKSampleType> = []
        
        if let steps = HKQuantityType.quantityType(forIdentifier: .stepCount) { readTypes.insert(steps) }
        if let energy = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) { readTypes.insert(energy); shareTypes.insert(energy) }
        if let hr = HKQuantityType.quantityType(forIdentifier: .heartRate) { readTypes.insert(hr) }
        if let rhr = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) { readTypes.insert(rhr) }
        if let dist = HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning) { readTypes.insert(dist) }
        if let sleep = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) { readTypes.insert(sleep) }
        if let weight = HKQuantityType.quantityType(forIdentifier: .bodyMass) { readTypes.insert(weight); shareTypes.insert(weight) }
        if let vo2 = HKQuantityType.quantityType(forIdentifier: .vo2Max) { readTypes.insert(vo2) }
        readTypes.insert(HKWorkoutType.workoutType())
        shareTypes.insert(HKWorkoutType.workoutType())
        
        healthStore.requestAuthorization(toShare: shareTypes, read: readTypes) { [weak self] success, error in
            guard let self = self else { return }
            
            var isActuallyAuthorized = success
            if let energy = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
                let status = self.healthStore.authorizationStatus(for: energy)
                isActuallyAuthorized = (status == .sharingAuthorized)
            }
            
            DispatchQueue.main.async {
                self.isAuthorized = isActuallyAuthorized
                if isActuallyAuthorized {
                    self.connectionState = .authorized
                    self.startBackgroundObservers()
                    self.fetchTodayMetrics { snapshot in
                        let hasData = snapshot.steps > 0 || snapshot.activeCalories > 0 || snapshot.sleepHours > 0
                        self.connectionState = hasData ? .connectedWithData : .connectedNoData
                    }
                } else {
                    self.connectionState = .denied
                }
            }
            completion(isActuallyAuthorized, error)
        }
    }
    
    // MARK: - Reconnect Apple Health with Verified Backend Sync
    public func reconnectAndSync(completion: @escaping (Bool) -> Void) {
        self.connectionState = .syncing
        
        requestAuthorization { [weak self] success, error in
            guard let self = self, success else {
                DispatchQueue.main.async {
                    self?.connectionState = .syncFailed
                    completion(false)
                }
                return
            }
            
            self.fetchTodayMetrics { [weak self] snapshot in
                guard let self = self else { return }
                
                guard let session = self.authService.currentSession, !session.userUUID.isEmpty else {
                    DispatchQueue.main.async {
                        // Unauthenticated session cannot synchronize to backend
                        let hasData = snapshot.steps > 0 || snapshot.activeCalories > 0 || snapshot.sleepHours > 0
                        self.connectionState = hasData ? .connectedWithData : .connectedNoData
                        completion(false)
                    }
                    return
                }
                
                let hasData = snapshot.steps > 0 || snapshot.activeCalories > 0 || snapshot.sleepHours > 0
                
                // Perform real Supabase backend sync
                let payload: [String: Any] = [
                    "userId": session.userUUID,
                    "steps": snapshot.steps,
                    "active_calories": snapshot.activeCalories,
                    "resting_hr": snapshot.restingHeartRateBpm,
                    "sleep_hours": snapshot.sleepHours,
                    "synced_at": ISO8601DateFormatter().string(from: Date())
                ]
                
                let endpoint = URL(string: "https://nwcatvlfoayzrwatvyrf.supabase.co/rest/v1/health_snapshots")!
                var request = URLRequest(url: endpoint)
                request.httpMethod = "POST"
                request.addValue("application/json", forHTTPHeaderField: "Content-Type")
                request.addValue(self.authService.supabaseAnonKey, forHTTPHeaderField: "apikey")
                request.addValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
                request.addValue("return=representation", forHTTPHeaderField: "Prefer")
                
                do {
                    request.httpBody = try JSONSerialization.data(withJSONObject: payload)
                } catch {
                    DispatchQueue.main.async {
                        self.connectionState = .syncFailed
                        completion(false)
                    }
                    return
                }
                
                URLSession.shared.dataTask(with: request) { _, response, httpError in
                    var isVerifiedBackendSuccess = false
                    if let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode), httpError == nil {
                        isVerifiedBackendSuccess = true
                    }
                    
                    DispatchQueue.main.async {
                        if isVerifiedBackendSuccess {
                            if hasData {
                                self.connectionState = .synced
                                self.lastSyncTimestamp = Date()
                                var updated = snapshot
                                updated.connectionState = .synced
                                updated.lastSyncedAt = Date()
                                self.currentSnapshot = updated
                            } else {
                                self.connectionState = .connectedNoData
                                var updated = snapshot
                                updated.connectionState = .connectedNoData
                                self.currentSnapshot = updated
                            }
                        } else {
                            self.connectionState = .syncFailed
                        }
                        completion(isVerifiedBackendSuccess)
                    }
                }.resume()
            }
        }
    }
    
    // MARK: - Fetch Today's Authentic Metrics
    public func fetchTodayMetrics(completion: ((TodayHealthSnapshot) -> Void)? = nil) {
        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)
        
        var snapshot = TodayHealthSnapshot(
            steps: 0,
            distanceKm: 0.0,
            activeCalories: 0,
            heartRateBpm: 0,
            restingHeartRateBpm: 0,
            sleepHours: 0.0,
            weightKg: 0.0,
            vo2Max: 0.0,
            connectionState: self.connectionState,
            lastSyncedAt: self.lastSyncTimestamp,
            lastUpdated: Date()
        )
        
        let group = DispatchGroup()
        
        // 1. Live CMPedometer Step Count (Hardware accurate)
        if CMPedometer.isStepCountingAvailable() {
            group.enter()
            pedometer.queryPedometerData(from: startOfDay, to: now) { data, _ in
                if let data = data {
                    snapshot.steps = data.numberOfSteps.intValue
                    if let dist = data.distance?.doubleValue {
                        snapshot.distanceKm = (dist / 1000.0 * 100).rounded() / 100.0
                    }
                }
                group.leave()
            }
        }
        
        guard HKHealthStore.isHealthDataAvailable() else {
            group.notify(queue: .main) {
                self.currentSnapshot = snapshot
                completion?(snapshot)
            }
            return
        }
        
        // 2. Active Calories from HealthKit
        if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            group.enter()
            let energyQuery = HKStatisticsQuery(quantityType: energyType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    snapshot.activeCalories = Int(sum.doubleValue(for: HKUnit.kilocalorie()))
                }
                group.leave()
            }
            healthStore.execute(energyQuery)
        }
        
        // 3. Resting Heart Rate
        if let rhrType = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) {
            group.enter()
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let rhrQuery = HKSampleQuery(sampleType: rhrType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                if let sample = samples?.first as? HKQuantitySample {
                    snapshot.restingHeartRateBpm = Int(sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute())))
                }
                group.leave()
            }
            healthStore.execute(rhrQuery)
        }
        
        // 4. Sleep Analysis
        if let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) {
            group.enter()
            let yesterday = calendar.date(byAdding: .day, value: -1, to: startOfDay) ?? startOfDay
            let sleepPredicate = HKQuery.predicateForSamples(withStart: yesterday, end: now, options: .strictStartDate)
            let sleepQuery = HKSampleQuery(sampleType: sleepType, predicate: sleepPredicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
                if let sleepSamples = samples as? [HKCategorySample] {
                    var totalSeconds: TimeInterval = 0
                    for sample in sleepSamples {
                        if sample.value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue ||
                           sample.value == HKCategoryValueSleepAnalysis.asleepCore.rawValue ||
                           sample.value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue ||
                           sample.value == HKCategoryValueSleepAnalysis.asleepREM.rawValue {
                            totalSeconds += sample.endDate.timeIntervalSince(sample.startDate)
                        }
                    }
                    if totalSeconds > 0 {
                        snapshot.sleepHours = (totalSeconds / 3600.0 * 10).rounded() / 10.0
                    }
                }
                group.leave()
            }
            healthStore.execute(sleepQuery)
        }
        
        group.notify(queue: .main) {
            let hasData = snapshot.steps > 0 || snapshot.activeCalories > 0 || snapshot.sleepHours > 0
            if self.isAuthorized && self.connectionState != .synced && self.connectionState != .syncing {
                self.connectionState = hasData ? .connectedWithData : .connectedNoData
            }
            snapshot.connectionState = self.connectionState
            self.currentSnapshot = snapshot

            // Sync hardware steps & active energy to widgets
            let suiteName = "group.com.supreethkiran.calyxo"
            let defaults = UserDefaults(suiteName: suiteName) ?? .standard
            if snapshot.steps > 0 {
                defaults.set(snapshot.steps, forKey: "widget_steps")
            }
            if snapshot.activeCalories > 0 {
                defaults.set(snapshot.activeCalories, forKey: "widget_active_calories")
            }
            defaults.synchronize()
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }

            completion?(snapshot)
        }
    }
    
    // MARK: - Background Delivery
    public func startBackgroundObservers() {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        
        if let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) {
            healthStore.enableBackgroundDelivery(for: stepType, frequency: .immediate) { success, _ in
                print("[CALYXO-HEALTHKIT] Background step delivery enabled: \(success)")
            }
        }
        
        if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            healthStore.enableBackgroundDelivery(for: energyType, frequency: .immediate) { success, _ in
                print("[CALYXO-HEALTHKIT] Background energy delivery enabled: \(success)")
            }
        }
    }
}
