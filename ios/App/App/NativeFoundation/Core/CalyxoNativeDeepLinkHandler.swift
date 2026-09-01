//
//  CalyxoNativeDeepLinkHandler.swift
//  Calyxo Native Foundation
//
//  Native Deep-Link and Notification Action router.
//

import Foundation

public final class CalyxoNativeDeepLinkHandler: ObservableObject {
    public static let shared = CalyxoNativeDeepLinkHandler()
    
    public enum Route: Equatable {
        case dashboard
        case workout
        case nutrition
        case health
        case authCallback(code: String?, accessToken: String?)
        case quickHydrate(amountMl: Int)
        case unknown(url: URL)
    }
    
    @Published public var activeRoute: Route = .dashboard
    
    private init() {}
    
    @discardableResult
    public func handle(url: URL) -> Bool {
        print("[CALYXO-DEEPLINK] 🔗 Received incoming deep link: \(url.absoluteString)")
        
        let urlString = url.absoluteString
        
        if urlString.contains("auth/callback") || urlString.contains("access_token=") || urlString.contains("code=") {
            var code: String?
            var accessToken: String?
            
            if let components = URLComponents(url: url, resolvingAgainstBaseURL: false) {
                code = components.queryItems?.first(where: { $0.name == "code" })?.value
            }
            
            if let fragment = url.fragment {
                let params = fragment.components(separatedBy: "&")
                for param in params {
                    let pair = param.components(separatedBy: "=")
                    if pair.count == 2, pair[0] == "access_token" {
                        accessToken = pair[1]
                    }
                }
            }
            
            self.activeRoute = .authCallback(code: code, accessToken: accessToken)
            return true
        }
        
        if url.host == "workout" || url.path.contains("workout") {
            self.activeRoute = .workout
            return true
        } else if url.host == "nutrition" || url.path.contains("nutrition") {
            self.activeRoute = .nutrition
            return true
        } else if url.host == "health" || url.path.contains("health") {
            self.activeRoute = .health
            return true
        } else if url.host == "dashboard" || url.path.contains("dashboard") {
            self.activeRoute = .dashboard
            return true
        }
        
        self.activeRoute = .unknown(url: url)
        return false
    }
    
    public func handleNotificationAction(identifier: String) {
        switch identifier {
        case "LOG_WATER_250":
            self.activeRoute = .quickHydrate(amountMl: 250)
        case "LOG_WATER_500":
            self.activeRoute = .quickHydrate(amountMl: 500)
        case "OPEN_WORKOUT":
            self.activeRoute = .workout
        case "OPEN_HYDRATION":
            self.activeRoute = .nutrition
        default:
            self.activeRoute = .dashboard
        }
    }
}
