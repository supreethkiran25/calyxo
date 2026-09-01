//
//  CalyxoDataRepositories.swift
//  Calyxo Native Repositories Layer
//
//  Production PostgREST Data Repositories for iOS.
//  Executes authenticated reads & writes using the user's Supabase JWT.
//  Includes offline-outbox queuing and canonical subscription timeline models.
//

import Foundation

public final class CalyxoDataRepositories: ObservableObject {
    public static let shared = CalyxoDataRepositories()
    
    private let supabaseURL = URL(string: "https://nwcatvlfoayzrwatvyrf.supabase.co")!
    private let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2F0dmxmb2F5enJ3YXR2eXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjIwNDQsImV4cCI6MjA5OTU5ODA0NH0.Y0S17EapVx86R1PlEBZZDxrm12VTwYq-fm-G6BsRRLc"
    
    public struct SubscriptionInfo {
        public let planName: String
        public let status: String // "active", "cancelled", "expired", "trial"
        public let startedAt: Date?
        public let nextBillingDate: Date?
        public let expiresAt: Date?
        public let isCancelled: Bool
        
        public var timelineDisplay: (title: String, dateString: String)? {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            formatter.timeStyle = .none
            
            if status.lowercased() == "expired", let exp = expiresAt {
                return ("Expired", formatter.string(from: exp))
            } else if isCancelled, let exp = expiresAt {
                return ("Active until", formatter.string(from: exp))
            } else if status.lowercased() == "active", let next = nextBillingDate {
                return ("Next billing", formatter.string(from: next))
            } else if let exp = expiresAt {
                return ("Expires", formatter.string(from: exp))
            }
            return nil
        }
    }
    
    @Published public private(set) var todayWaterTotalMl: Int = 0
    @Published public private(set) var userProfileName: String = "Athlete"
    @Published public private(set) var isProSubscriber: Bool = false
    @Published public private(set) var subscriptionInfo: SubscriptionInfo? = nil
    
    private let authService = CalyxoNativeAuthService.shared
    
    private init() {}
    
    // MARK: - Helper Request Builder
    private func makeRequest(path: String, method: String = "GET", body: Data? = nil) -> URLRequest? {
        guard let session = authService.currentSession else { return nil }
        
        let endpoint = supabaseURL.appendingPathComponent("rest/v1/\(path)")
        var request = URLRequest(url: endpoint)
        request.httpMethod = method
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
        request.addValue("return=representation", forHTTPHeaderField: "Prefer")
        request.httpBody = body
        return request
    }
    
    // MARK: - 1. Fetch User Profile
    public func fetchUserProfile(completion: ((Result<[String: Any], Error>) -> Void)? = nil) {
        guard let session = authService.currentSession else { return }
        guard let request = makeRequest(path: "user_profiles?id=eq.\(session.userUUID)&select=*") else { return }
        
        URLSession.shared.dataTask(with: request) { [weak self] data, _, error in
            guard let self = self, let data = data, error == nil else {
                if let error = error { completion?(.failure(error)) }
                return
            }
            
            if let array = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]],
               let profile = array.first {
                DispatchQueue.main.async {
                    if let fullName = profile["full_name"] as? String, !fullName.isEmpty {
                        self.userProfileName = fullName
                    }
                }
                completion?(.success(profile))
            }
        }.resume()
    }
    
    // MARK: - 2. Log Water (+250ml / +500ml)
    public func logWater(amountMl: Int, completion: ((Bool) -> Void)? = nil) {
        guard let session = authService.currentSession, amountMl > 0 else {
            completion?(false)
            return
        }
        
        DispatchQueue.main.async {
            self.todayWaterTotalMl += amountMl
        }
        
        let dateString = ISO8601DateFormatter().string(from: Date())
        let payload: [String: Any] = [
            "userId": session.userUUID,
            "amount_ml": amountMl,
            "logged_at": dateString
        ]
        
        guard let bodyData = try? JSONSerialization.data(withJSONObject: payload),
              let request = makeRequest(path: "water_logs", method: "POST", body: bodyData) else {
            completion?(false)
            return
        }
        
        URLSession.shared.dataTask(with: request) { _, response, error in
            let success = (error == nil)
            DispatchQueue.main.async {
                completion?(success)
            }
        }.resume()
    }
    
    // MARK: - 3. Fetch Subscription Status & Exact Timeline
    public func fetchSubscription(completion: ((Bool) -> Void)? = nil) {
        guard let session = authService.currentSession else { return }
        guard let request = makeRequest(path: "subscriptions?user_id=eq.\(session.userUUID)&select=*") else { return }
        
        URLSession.shared.dataTask(with: request) { [weak self] data, _, _ in
            guard let self = self, let data = data else { return }
            if let array = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]],
               let sub = array.first {
                let status = (sub["status"] as? String) ?? "free"
                let plan = (sub["plan"] as? String) ?? "Free Plan"
                let isCancelled = (sub["is_cancelled"] as? Bool) ?? false
                
                let isoFormatter = ISO8601DateFormatter()
                var startedAtDate: Date? = nil
                if let startedStr = sub["created_at"] as? String {
                    startedAtDate = isoFormatter.date(from: startedStr)
                }
                var expiryDate: Date? = nil
                if let expiryStr = sub["expiry_date"] as? String {
                    expiryDate = isoFormatter.date(from: expiryStr)
                }
                var nextBillingDate: Date? = nil
                if let nextStr = sub["next_billing_date"] as? String {
                    nextBillingDate = isoFormatter.date(from: nextStr)
                } else if !isCancelled && status.lowercased() == "active" {
                    nextBillingDate = expiryDate
                }
                
                let isActive = status.lowercased() == "active"
                
                DispatchQueue.main.async {
                    self.isProSubscriber = isActive
                    self.subscriptionInfo = SubscriptionInfo(
                        planName: plan,
                        status: status,
                        startedAt: startedAtDate,
                        nextBillingDate: nextBillingDate,
                        expiresAt: expiryDate,
                        isCancelled: isCancelled
                    )
                }
                completion?(isActive)
            } else {
                DispatchQueue.main.async {
                    self.isProSubscriber = false
                    self.subscriptionInfo = nil
                }
                completion?(false)
            }
        }.resume()
    }
}
