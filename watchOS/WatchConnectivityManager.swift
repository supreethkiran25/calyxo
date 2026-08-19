import Foundation
import WatchConnectivity

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()

    @Published var lastSyncTime: Date = Date()
    @Published var syncedWater: Int = 0
    @Published var syncedCalories: Int = 0

    override init() {
        super.init()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("[WatchConnectivityManager] Activation did complete: \(activationState.rawValue)")
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        DispatchQueue.main.async {
            if let water = message["water"] as? Int {
                self.syncedWater = water
            }
            if let calories = message["calories"] as? Int {
                self.syncedCalories = calories
            }
            self.lastSyncTime = Date()
        }
    }

    func sendLogToiPhone(type: String, value: Any) {
        guard WCSession.default.isReachable else { return }
        WCSession.default.sendMessage(["logType": type, "value": value], replyHandler: nil)
    }
}
