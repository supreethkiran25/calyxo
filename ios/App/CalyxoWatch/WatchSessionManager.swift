import Foundation
import WatchConnectivity
import WatchKit

class WatchSessionManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchSessionManager()

    @Published var calories: Int = 0
    @Published var calorieGoal: Int = 2000
    @Published var water: Int = 0
    @Published var waterGoal: Int = 2500
    @Published var protein: Int = 0
    @Published var proteinGoal: Int = 150
    @Published var activeWorkoutName: String = "Rest Day"
    @Published var currentSet: Int = 1
    @Published var totalSets: Int = 3
    @Published var isResting: Bool = false
    @Published var restSecondsRemaining: Int = 0

    private override init() {
        super.init()
    }

    func startSession() {
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("[CALYXO-WATCH] Session activation error: \(error.localizedDescription)")
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        DispatchQueue.main.async {
            self.parseData(applicationContext)
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        DispatchQueue.main.async {
            self.parseData(message)
            if message["haptic"] as? Bool == true {
                WKInterfaceDevice.current().play(.notification)
            }
        }
    }

    private func parseData(_ dict: [String: Any]) {
        if let cal = dict["calories"] as? Int { self.calories = cal }
        if let cg = dict["calorieGoal"] as? Int { self.calorieGoal = cg }
        if let w = dict["water"] as? Int { self.water = w }
        if let wg = dict["waterGoal"] as? Int { self.waterGoal = wg }
        if let p = dict["protein"] as? Int { self.protein = p }
        if let pg = dict["proteinGoal"] as? Int { self.proteinGoal = pg }
        if let wn = dict["workoutName"] as? String { self.activeWorkoutName = wn }
        if let cs = dict["currentSet"] as? Int { self.currentSet = cs }
        if let ts = dict["totalSets"] as? Int { self.totalSets = ts }
        if let ir = dict["isResting"] as? Bool { self.isResting = ir }
        if let rs = dict["restSecondsRemaining"] as? Int { self.restSecondsRemaining = rs }
    }

    func logWaterQuick(amount: Int) {
        self.water += amount
        WKInterfaceDevice.current().play(.click)
        if WCSession.default.isReachable {
            WCSession.default.sendMessage(["action": "addWater", "amount": amount], replyHandler: nil, errorHandler: nil)
        } else {
            try? WCSession.default.updateApplicationContext(["action": "addWater", "amount": amount])
        }
    }
}
