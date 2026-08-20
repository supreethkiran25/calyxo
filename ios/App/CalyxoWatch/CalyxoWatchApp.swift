import SwiftUI
import WatchKit
import WatchConnectivity

@main
struct CalyxoWatchApp: App {
    @WKApplicationDelegateAdaptor(ExtensionDelegate.self) var delegate

    var body: some Scene {
        WindowGroup {
            NavigationView {
                WatchMainView()
            }
        }
    }
}

class ExtensionDelegate: NSObject, WKApplicationDelegate {
    func applicationDidFinishLaunching() {
        WatchSessionManager.shared.startSession()
    }
}
