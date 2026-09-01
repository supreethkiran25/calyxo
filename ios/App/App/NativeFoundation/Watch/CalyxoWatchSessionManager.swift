//
//  CalyxoWatchSessionManager.swift
//  Calyxo Native Foundation
//
//  Native WatchConnectivity (WCSession) Manager for Apple Watch Companion App.
//  Coordinates bidirectional telemetry streaming, workout set mirrors, and rest timer sync.
//

import Foundation
import WatchConnectivity

public final class CalyxoWatchSessionManager: NSObject, ObservableObject {
    public static let shared = CalyxoWatchSessionManager()
    
    @Published public private(set) var isWatchPaired: Bool = false
    @Published public private(set) var isWatchAppInstalled: Bool = false
    @Published public private(set) var isSessionReachable: Bool = false
    @Published public private(set) var watchHeartRateBpm: Int?
    
    public struct WorkoutMirrorPayload: Codable {
        public let workoutId: String
        public let exerciseName: String
        public let setNumber: Int
        public let targetReps: Int
        public let targetWeightKg: Double
        public let restRemainingSeconds: Int
        public let isRestActive: Bool
    }
    
    override private init() {
        super.init()
        setupWatchSession()
    }
    
    private func setupWatchSession() {
        guard WCSession.isSupported() else {
            print("[CALYXO-WATCH] ⚠️ WatchConnectivity is not supported on this device.")
            return
        }
        let session = WCSession.default
        session.delegate = self
        session.activate()
    }
    
    // MARK: - Send Live Workout State to Apple Watch
    public func sendWorkoutState(_ payload: WorkoutMirrorPayload) {
        guard WCSession.default.activationState == .activated, WCSession.default.isWatchAppInstalled else { return }
        
        do {
            let data = try JSONEncoder().encode(payload)
            if let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                if WCSession.default.isReachable {
                    WCSession.default.sendMessage(dict, replyHandler: nil) { error in
                        print("[CALYXO-WATCH] ❌ Failed to send live message: \(error.localizedDescription)")
                    }
                } else {
                    // Update application context for background sync
                    try WCSession.default.updateApplicationContext(dict)
                }
            }
        } catch {
            print("[CALYXO-WATCH] ❌ Failed to encode workout payload: \(error.localizedDescription)")
        }
    }
}

// MARK: - WCSessionDelegate
extension CalyxoWatchSessionManager: WCSessionDelegate {
    public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isWatchPaired = session.isPaired
            self.isWatchAppInstalled = session.isWatchAppInstalled
            self.isSessionReachable = session.isReachable
        }
        print("[CALYXO-WATCH] ✅ WCSession activated (State: \(activationState.rawValue), Paired: \(session.isPaired), AppInstalled: \(session.isWatchAppInstalled))")
    }
    
    public func sessionDidBecomeInactive(_ session: WCSession) {}
    
    public func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }
    
    public func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isSessionReachable = session.isReachable
        }
    }
    
    // Receive telemetry or set completion from Apple Watch
    public func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        DispatchQueue.main.async {
            if let bpm = message["watch_heart_rate"] as? Int, bpm > 0 {
                self.watchHeartRateBpm = bpm
            }
            if let completedSet = message["set_completed"] as? Bool, completedSet {
                print("[CALYXO-WATCH] 🦾 Set completed confirmation received from Apple Watch.")
            }
        }
    }
}
