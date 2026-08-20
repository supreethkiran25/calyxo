import Capacitor
import UserNotifications
import UIKit

/// Production-grade Native iOS Notification Plugin
/// Interfaces directly with UNUserNotificationCenter &amp; APNs registration.
/// JS calls: Capacitor.Plugins.CalyxoNotification.*
@objc(CalyxoNotificationPlugin)
public class CalyxoNotificationPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalyxoNotificationPlugin"
    public let jsName = "CalyxoNotification"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getPermissionStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "registerForPush", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scheduleLocalNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelLocalNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPendingDeepLink", returnType: CAPPluginReturnPromise)
    ]

    @objc public func getPermissionStatus(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let statusString: String
            switch settings.authorizationStatus {
            case .authorized: statusString = "authorized"
            case .denied: statusString = "denied"
            case .notDetermined: statusString = "notDetermined"
            case .provisional: statusString = "provisional"
            case .ephemeral: statusString = "ephemeral"
            @unknown default: statusString = "unknown"
            }

            let isRegistered = DispatchQueue.main.sync {
                UIApplication.shared.isRegisteredForRemoteNotifications
            }

            print("[CALYXO-PUSH] getPermissionStatus = \(statusString), isRegisteredForRemote = \(isRegistered)")
            call.resolve([
                "status": statusString,
                "isRegistered": isRegistered
            ])
        }
    }

    @objc public override func requestPermissions(_ call: CAPPluginCall) {
        print("[CALYXO-PUSH] Requesting UNUserNotificationCenter authorization from user...")
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if let error = error {
                print("[CALYXO-PUSH] Permission request ERROR: \(error.localizedDescription)")
                call.reject(error.localizedDescription)
                return
            }

            print("[CALYXO-PUSH] Permission granted = \(granted)")
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                    print("[CALYXO-PUSH] Calling UIApplication.shared.registerForRemoteNotifications()...")
                }
            }

            call.resolve([
                "granted": granted,
                "status": granted ? "authorized" : "denied"
            ])
        }
    }

    @objc public func registerForPush(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
            print("[CALYXO-PUSH] registerForPush invoked on UIApplication")
            call.resolve(["initiated": true])
        }
    }

    /// Schedule a native UNNotificationRequest with optional deep-link userInfo.
    /// userInfo keys: type, workoutId, exerciseName, setNumber
    @objc public func scheduleLocalNotification(_ call: CAPPluginCall) {
        let title = call.getString("title") ?? "Calyxo"
        let body = call.getString("body") ?? ""
        let delaySeconds = max(1, call.getInt("delaySeconds") ?? 1)
        let identifier = call.getString("id") ?? UUID().uuidString

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        // Attach deep-link metadata so notification taps can route correctly
        var userInfo: [AnyHashable: Any] = ["notificationId": identifier]
        if let type_ = call.getString("type") { userInfo["type"] = type_ }
        if let workoutId = call.getString("workoutId") { userInfo["workoutId"] = workoutId }
        if let exerciseName = call.getString("exerciseName") { userInfo["exerciseName"] = exerciseName }
        if let setNumber = call.getInt("setNumber") { userInfo["setNumber"] = setNumber }
        content.userInfo = userInfo

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: TimeInterval(delaySeconds), repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[CALYXO-PUSH] scheduleLocalNotification error: \(error.localizedDescription)")
                call.reject(error.localizedDescription)
            } else {
                print("[CALYXO-PUSH] Scheduled '\(title)' id=\(identifier) in \(delaySeconds)s")
                call.resolve(["success": true, "id": identifier])
            }
        }
    }

    /// Cancel a pending notification by ID.
    @objc public func cancelLocalNotification(_ call: CAPPluginCall) {
        guard let identifier = call.getString("id"), !identifier.isEmpty else {
            call.resolve(["cancelled": false, "reason": "No id provided"])
            return
        }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
        print("[CALYXO-PUSH] Cancelled pending notification id=\(identifier)")
        call.resolve(["cancelled": true, "id": identifier])
    }

    /// Read and consume the pending deep-link stored by AppDelegate after a notification tap.
    /// Returns the deep-link dict and clears it so it is only consumed once.
    @objc public func getPendingDeepLink(_ call: CAPPluginCall) {
        if let link = AppDelegate.pendingNotificationDeepLink {
            AppDelegate.pendingNotificationDeepLink = nil
            print("[CALYXO-PUSH] Consuming pending deep-link: \(link)")
            call.resolve(link)
        } else {
            call.resolve([:])
        }
    }
}

