//
//  CalyxoNativeAuthService.swift
//  Calyxo Native Foundation
//
//  Native Supabase GoTrue authentication engine for iOS.
//  Preserves existing Supabase project, user UUIDs, RLS, and database schemas.
//

import Foundation

public final class CalyxoNativeAuthService: ObservableObject {
    public static let shared = CalyxoNativeAuthService()
    
    public let supabaseURL = URL(string: "https://nwcatvlfoayzrwatvyrf.supabase.co")!
    public let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2F0dmxmb2F5enJ3YXR2eXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjIwNDQsImV4cCI6MjA5OTU5ODA0NH0.Y0S17EapVx86R1PlEBZZDxrm12VTwYq-fm-G6BsRRLc"
    
    @Published public private(set) var currentSession: CalyxoKeychainStorage.StoredSession?
    @Published public private(set) var isAuthenticated: Bool = false
    @Published public private(set) var authError: String?
    
    private let keychain = CalyxoKeychainStorage.shared
    
    private init() {
        restoreSession()
    }
    
    // MARK: - Restore Session
    @discardableResult
    public func restoreSession() -> Bool {
        guard let session = keychain.loadSession() else {
            DispatchQueue.main.async {
                self.currentSession = nil
                self.isAuthenticated = false
            }
            return false
        }
        
        if session.isExpired {
            print("[CALYXO-AUTH] ⚠️ Session expired. Refreshing token...")
            refreshSession(refreshToken: session.refreshToken)
            return true
        }
        
        DispatchQueue.main.async {
            self.currentSession = session
            self.isAuthenticated = true
            self.authError = nil
        }
        print("[CALYXO-AUTH] ✅ Native session restored from Keychain for user: \(session.userEmail) (UUID: \(session.userUUID))")
        return true
    }
    
    // MARK: - Sign In (Email / Password)
    public func signIn(email: String, password: String, completion: @escaping (Result<CalyxoKeychainStorage.StoredSession, Error>) -> Void) {
        let endpoint = supabaseURL.appendingPathComponent("auth/v1/token")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        
        var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "grant_type", value: "password")]
        request.url = components.url
        
        let bodyPayload: [String: Any] = [
            "email": email.trimmingCharacters(in: .whitespacesAndNewlines),
            "password": password
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: bodyPayload)
        } catch {
            completion(.failure(error))
            return
        }
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let self = self else { return }
            
            if let error = error {
                DispatchQueue.main.async { self.authError = error.localizedDescription }
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                let err = NSError(domain: "CalyxoAuth", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received from Supabase"])
                DispatchQueue.main.async { self.authError = err.localizedDescription }
                completion(.failure(err))
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    if let errorMsg = json["error_description"] as? String ?? json["msg"] as? String {
                        let err = NSError(domain: "CalyxoAuth", code: 400, userInfo: [NSLocalizedDescriptionKey: errorMsg])
                        DispatchQueue.main.async { self.authError = errorMsg }
                        completion(.failure(err))
                        return
                    }
                    
                    guard let accessToken = json["access_token"] as? String,
                          let refreshToken = json["refresh_token"] as? String,
                          let userObj = json["user"] as? [String: Any],
                          let userUUID = userObj["id"] as? String else {
                        let err = NSError(domain: "CalyxoAuth", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid Supabase auth response structure"])
                        DispatchQueue.main.async { self.authError = err.localizedDescription }
                        completion(.failure(err))
                        return
                    }
                    
                    let userEmail = userObj["email"] as? String ?? email
                    let expiresIn = (json["expires_in"] as? Double) ?? 3600.0
                    let expiresAt = Date().timeIntervalSince1970 + expiresIn
                    
                    let session = CalyxoKeychainStorage.StoredSession(
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        userUUID: userUUID,
                        userEmail: userEmail,
                        expiresAt: expiresAt
                    )
                    
                    self.keychain.saveSession(session)
                    
                    DispatchQueue.main.async {
                        self.currentSession = session
                        self.isAuthenticated = true
                        self.authError = nil
                    }
                    
                    print("[CALYXO-AUTH] ✅ Successfully authenticated user \(userEmail) (UUID: \(userUUID))")
                    completion(.success(session))
                }
            } catch {
                DispatchQueue.main.async { self.authError = error.localizedDescription }
                completion(.failure(error))
            }
        }.resume()
    }
    
    // MARK: - Refresh Session
    public func refreshSession(refreshToken: String, completion: ((Result<CalyxoKeychainStorage.StoredSession, Error>) -> Void)? = nil) {
        let endpoint = supabaseURL.appendingPathComponent("auth/v1/token")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        
        var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "grant_type", value: "refresh_token")]
        request.url = components.url
        
        let bodyPayload: [String: Any] = ["refresh_token": refreshToken]
        guard let bodyData = try? JSONSerialization.data(withJSONObject: bodyPayload) else { return }
        request.httpBody = bodyData
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let self = self, let data = data, error == nil else {
                completion?(.failure(error ?? NSError(domain: "CalyxoAuth", code: -3, userInfo: nil)))
                return
            }
            
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let accessToken = json["access_token"] as? String,
               let newRefreshToken = json["refresh_token"] as? String,
               let userObj = json["user"] as? [String: Any],
               let userUUID = userObj["id"] as? String {
                
                let userEmail = userObj["email"] as? String ?? (self.currentSession?.userEmail ?? "")
                let expiresIn = (json["expires_in"] as? Double) ?? 3600.0
                let expiresAt = Date().timeIntervalSince1970 + expiresIn
                
                let session = CalyxoKeychainStorage.StoredSession(
                    accessToken: accessToken,
                    refreshToken: newRefreshToken,
                    userUUID: userUUID,
                    userEmail: userEmail,
                    expiresAt: expiresAt
                )
                
                self.keychain.saveSession(session)
                DispatchQueue.main.async {
                    self.currentSession = session
                    self.isAuthenticated = true
                }
                print("[CALYXO-AUTH] 🔄 Native session token successfully refreshed.")
                completion?(.success(session))
            } else {
                self.signOut()
            }
        }.resume()
    }
    
    // MARK: - Sign Out
    public func signOut(completion: (() -> Void)? = nil) {
        keychain.clearSession()
        DispatchQueue.main.async {
            self.currentSession = nil
            self.isAuthenticated = false
            self.authError = nil
        }
        print("[CALYXO-AUTH] 🔒 User signed out. Session cleared.")
        completion?()
    }
}
