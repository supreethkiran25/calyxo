import UIKit
import Capacitor
import HealthKit
import UserNotifications

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
        // are captured for deep-linking into the workout screen.
        UNUserNotificationCenter.current().delegate = self
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
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

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        // NOTE: Do not log full token in production builds.
        print("[CALYXO-PUSH] APNs registration SUCCEEDED. Token length: \(token.count) chars")
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[CALYXO-PUSH] APNs registration FAILED: \(error.localizedDescription)")
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

        let readTypes: Set<HKObjectType> = [
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
                }
                completion(success, error)
            }
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
        if let type_ = userInfo["type"] as? String       { deepLink["type"] = type_ }
        if let workoutId = userInfo["workoutId"] as? String { deepLink["workoutId"] = workoutId }
        if let exName = userInfo["exerciseName"] as? String { deepLink["exerciseName"] = exName }
        if let setNum = userInfo["setNumber"] as? Int       { deepLink["setNumber"] = setNum }
        if let notifId = userInfo["notificationId"] as? String { deepLink["notificationId"] = notifId }

        if !deepLink.isEmpty {
            AppDelegate.pendingNotificationDeepLink = deepLink
            print("[CALYXO-PUSH] Deep-link queued for JS: \(deepLink)")
        }

        completionHandler()
    }

    /// Show banners even when app is foregrounded so rest-complete alerts appear over the workout UI.
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
}
