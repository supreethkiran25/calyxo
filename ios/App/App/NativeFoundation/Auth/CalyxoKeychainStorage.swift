//
//  CalyxoKeychainStorage.swift
//  Calyxo Native Foundation
//
//  Hardware-backed Apple Keychain storage for Supabase JWT tokens and session data.
//  Zero dependence on localStorage, sessionStorage, or browser cookies.
//

import Foundation
import Security

public final class CalyxoKeychainStorage {
    public static let shared = CalyxoKeychainStorage()
    
    private let serviceName = "com.supreethkiran.calyxo.auth"
    private let accountSessionKey = "supabase_session_v1"
    private let accountUserUUIDKey = "supabase_user_uuid"
    
    public struct StoredSession: Codable, Equatable {
        public let accessToken: String
        public let refreshToken: String
        public let userUUID: String
        public let userEmail: String
        public let expiresAt: TimeInterval
        
        public var isExpired: Bool {
            return Date().timeIntervalSince1970 >= expiresAt
        }
        
        public init(accessToken: String, refreshToken: String, userUUID: String, userEmail: String, expiresAt: TimeInterval) {
            self.accessToken = accessToken
            self.refreshToken = refreshToken
            self.userUUID = userUUID
            self.userEmail = userEmail
            self.expiresAt = expiresAt
        }
    }
    
    private init() {}
    
    // MARK: - Save Session
    @discardableResult
    public func saveSession(_ session: StoredSession) -> Bool {
        do {
            let data = try JSONEncoder().encode(session)
            return set(data: data, forKey: accountSessionKey)
        } catch {
            print("[CALYXO-KEYCHAIN] ❌ Failed to encode session: \(error.localizedDescription)")
            return false
        }
    }
    
    // MARK: - Load Session
    public func loadSession() -> StoredSession? {
        guard let data = get(forKey: accountSessionKey) else {
            return nil
        }
        do {
            let session = try JSONDecoder().decode(StoredSession.self, from: data)
            return session
        } catch {
            print("[CALYXO-KEYCHAIN] ❌ Failed to decode stored session: \(error.localizedDescription)")
            return nil
        }
    }
    
    // MARK: - Clear Session
    @discardableResult
    public func clearSession() -> Bool {
        let deletedSession = delete(forKey: accountSessionKey)
        let deletedUUID = delete(forKey: accountUserUUIDKey)
        print("[CALYXO-KEYCHAIN] 🔒 Cleared native session from Keychain.")
        return deletedSession || deletedUUID
    }
    
    // MARK: - Low Level Keychain CRUD
    private func set(data: Data, forKey key: String) -> Bool {
        delete(forKey: key)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }
    
    private func get(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == errSecSuccess, let data = dataTypeRef as? Data {
            return data
        }
        return nil
    }
    
    private func delete(forKey key: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }
}
