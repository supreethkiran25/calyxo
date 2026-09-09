import UIKit
import Capacitor
import HealthKit
import UserNotifications
import WidgetKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    // Real HKHealthStore instance — shared across the app
    static let healthStore = HKHealthStore()

    /// Deep-link payload from the most recent notification tap.
    /// Set by userNotificationCenter(_:didReceive:) and consumed once
    /// by CalyxoNotificationPlugin.getPendingDeepLink().
    static var pendingNotificationDeepLink: [String: Any]? = nil

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Register as UNUserNotificationCenterDelegate so notification taps
        // and interactive actions are captured for deep-linking
        UNUserNotificationCenter.current().delegate = self
        registerNotificationCategories()
        AppDelegate.startHealthKitBackgroundObserver()
        AppDelegate.refreshAndSyncWidgets()
        return true
    }

    private func registerNotificationCategories() {
        // Hydration Category Actions
        let log250Action = UNNotificationAction(
            identifier: "LOG_WATER_250",
            title: "💧 +250ml",
            options: [.foreground]
        )
        let log500Action = UNNotificationAction(
            identifier: "LOG_WATER_500",
            title: "🥛 +500ml",
            options: [.foreground]
        )
        let openWaterAction = UNNotificationAction(
            identifier: "OPEN_HYDRATION",
            title: "⚡ Log Water",
            options: [.foreground]
        )
        let hydrationCategory = UNNotificationCategory(
            identifier: "CALYXO_HYDRATION_CATEGORY",
            actions: [log250Action, log500Action, openWaterAction],
            intentIdentifiers: [],
            options: []
        )

        // Meal Category Actions
        let logMealAction = UNNotificationAction(
            identifier: "LOG_MEAL",
            title: "🥗 Log Meal",
            options: [.foreground]
        )
        let mealCategory = UNNotificationCategory(
            identifier: "CALYXO_MEAL_CATEGORY",
            actions: [logMealAction],
            intentIdentifiers: [],
            options: []
        )

        // Workout Category Actions
        let startWorkoutAction = UNNotificationAction(
            identifier: "START_WORKOUT",
            title: "🏋️ Start Workout",
            options: [.foreground]
        )
        let workoutCategory = UNNotificationCategory(
            identifier: "CALYXO_WORKOUT_CATEGORY",
            actions: [startWorkoutAction],
            intentIdentifiers: [],
            options: []
        )

        UNUserNotificationCenter.current().setNotificationCategories([hydrationCategory, mealCategory, workoutCategory])
    }

    func applicationWillResignActive(_ application: UIApplication) {
        AppDelegate.refreshAndSyncWidgets()
    }
    func applicationDidEnterBackground(_ application: UIApplication) {
        AppDelegate.refreshAndSyncWidgets()
    }
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {
        AppDelegate.refreshAndSyncWidgets()
    }
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }

    // MARK: - APNs Remote Notifications

    static var apnsDeviceToken: String? = nil

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        AppDelegate.apnsDeviceToken = token
        print("[CALYXO-PUSH] APNs registration SUCCEEDED. Token length: \(token.count) chars")
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[CALYXO-PUSH] Remote APNs note: \(error.localizedDescription). Local notifications active.")
    }

    // MARK: - HealthKit Authorization (called from JS via Capacitor plugin)

    /// Request HealthKit authorization for all Calyxo-relevant data types.
    @objc static func requestHealthKitAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("[CALYXO-HEALTH] Health data is NOT available on this device.")
            completion(false, NSError(domain: "com.calyxo.healthkit", code: 1,
                userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device."]))
            return
        }

        var readTypes: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!,
            HKObjectType.quantityType(forIdentifier: .bodyMass)!,
            HKObjectType.quantityType(forIdentifier: .bodyFatPercentage)!,
            HKObjectType.quantityType(forIdentifier: .restingHeartRate)!,
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
            HKObjectType.workoutType()
        ]

        // Garmin / Endurance / Recovery Types
        if let cyclingType = HKQuantityType.quantityType(forIdentifier: .distanceCycling) { readTypes.insert(cyclingType) }
        if let swimType = HKQuantityType.quantityType(forIdentifier: .distanceSwimming) { readTypes.insert(swimType) }
        if let vo2Type = HKQuantityType.quantityType(forIdentifier: .vo2Max) { readTypes.insert(vo2Type) }
        if let hrvType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) { readTypes.insert(hrvType) }
        if let waterType = HKQuantityType.quantityType(forIdentifier: .dietaryWater) { readTypes.insert(waterType) }
        if let walkingHRType = HKQuantityType.quantityType(forIdentifier: .walkingHeartRateAverage) { readTypes.insert(walkingHRType) }

        let writeTypes: Set<HKSampleType> = [
            HKObjectType.quantityType(forIdentifier: .bodyMass)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.workoutType()
        ]

        DispatchQueue.main.async {
            healthStore.requestAuthorization(toShare: writeTypes, read: readTypes) { success, error in
                if let error = error {
                    print("[CALYXO-HEALTH] Authorization ERROR: \(error.localizedDescription)")
                } else {
                    print("[CALYXO-HEALTH] Authorization result: \(success ? "GRANTED" : "DENIED")")
                    if success {
                        AppDelegate.startHealthKitBackgroundObserver()
                        AppDelegate.refreshAndSyncWidgets()
                    }
                }
                completion(success, error)
            }
        }
    }

    // MARK: - HealthKit Background Observer & Real-Time Widget Sync

    /// Setup background delivery observer queries so steps, calories, and heart rate reload in real time
    static func startHealthKitBackgroundObserver() {
        guard HKHealthStore.isHealthDataAvailable() else { return }

        if let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) {
            let stepObserver = HKObserverQuery(sampleType: stepType, predicate: nil) { query, completionHandler, error in
                if error == nil {
                    AppDelegate.refreshAndSyncWidgets {
                        completionHandler()
                    }
                } else {
                    completionHandler()
                }
            }
            healthStore.execute(stepObserver)
            healthStore.enableBackgroundDelivery(for: stepType, frequency: .immediate) { success, err in
                print("[CALYXO-WIDGET] HealthKit step background delivery enabled: \(success)")
            }
        }

        if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            let energyObserver = HKObserverQuery(sampleType: energyType, predicate: nil) { query, completionHandler, error in
                if error == nil {
                    AppDelegate.refreshAndSyncWidgets {
                        completionHandler()
                    }
                } else {
                    completionHandler()
                }
            }
            healthStore.execute(energyObserver)
            healthStore.enableBackgroundDelivery(for: energyType, frequency: .immediate) { success, err in
                print("[CALYXO-WIDGET] HealthKit energy background delivery enabled: \(success)")
            }
        }

        if let hrType = HKQuantityType.quantityType(forIdentifier: .heartRate) {
            let hrObserver = HKObserverQuery(sampleType: hrType, predicate: nil) { _, completionHandler, _ in
                completionHandler()
            }
            healthStore.execute(hrObserver)
            healthStore.enableBackgroundDelivery(for: hrType, frequency: .immediate) { success, err in
                print("[CALYXO-HEALTH] HealthKit heart rate background delivery enabled: \(success)")
            }
        }

        if let rhrType = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) {
            let rhrObserver = HKObserverQuery(sampleType: rhrType, predicate: nil) { _, completionHandler, _ in
                completionHandler()
            }
            healthStore.execute(rhrObserver)
            healthStore.enableBackgroundDelivery(for: rhrType, frequency: .immediate) { success, err in
                print("[CALYXO-HEALTH] HealthKit resting HR background delivery enabled: \(success)")
            }
        }
    }

    /// Read today's cumulative steps & active calories directly from HealthKit and push into App Group UserDefaults
    @objc static func refreshAndSyncWidgets(completion: (() -> Void)? = nil) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion?()
            return
        }

        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

        let suiteName = "group.com.supreethkiran.calyxo"
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            completion?()
            return
        }

        let group = DispatchGroup()

        if let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) {
            group.enter()
            let stepQuery = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let steps = Int(sum.doubleValue(for: HKUnit.count()))
                    if steps > 0 {
                        defaults.set(steps, forKey: "widget_steps")
                    }
                }
                group.leave()
            }
            healthStore.execute(stepQuery)
        }

        if let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            group.enter()
            let energyQuery = HKStatisticsQuery(quantityType: energyType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                if let sum = stats?.sumQuantity() {
                    let kcal = Int(sum.doubleValue(for: HKUnit.kilocalorie()))
                    if kcal > 0 {
                        defaults.set(kcal, forKey: "widget_calories")
                    }
                }
                group.leave()
            }
            healthStore.execute(energyQuery)
        }

        group.notify(queue: .main) {
            defaults.synchronize()
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
                print("[CALYXO-WIDGET] WidgetCenter reloaded with real-time data.")
            }
            completion?()
        }
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension AppDelegate: UNUserNotificationCenterDelegate {

    /// Called when the user taps a notification while foregrounded, backgrounded, or after cold launch.
    /// Stores the deep-link payload; JS reads it via CalyxoNotificationPlugin.getPendingDeepLink().
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        print("[CALYXO-PUSH] Notification tapped. userInfo keys: \(userInfo.keys.map { $0 })")

        var deepLink: [String: Any] = [:]
        deepLink["action"] = response.actionIdentifier
        if let type_ = userInfo["type"] as? String       { deepLink["type"] = type_ }
        if let workoutId = userInfo["workoutId"] as? String { deepLink["workoutId"] = workoutId }
        if let exName = userInfo["exerciseName"] as? String { deepLink["exerciseName"] = exName }
        if let setNum = userInfo["setNumber"] as? Int       { deepLink["setNumber"] = setNum }
        if let notifId = userInfo["notificationId"] as? String { deepLink["notificationId"] = notifId }
        if let tag = userInfo["tag"] as? String { deepLink["tag"] = tag }

        AppDelegate.pendingNotificationDeepLink = deepLink
        print("[CALYXO-PUSH] Deep-link action queued for JS: \(deepLink)")

        completionHandler()
    }

    /// Show banners even when app is foregrounded so rest-complete alerts appear over the workout UI.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge, .list])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
}
