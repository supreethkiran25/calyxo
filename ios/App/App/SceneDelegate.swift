import UIKit
import Capacitor

/// Custom CAPBridgeViewController that explicitly registers all Calyxo native plugins
/// with Capacitor's bridge upon WebView initialization.
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()

        // Register custom native plugins directly with Capacitor bridge
        bridge?.registerPluginInstance(CalyxoHealthKitPlugin())
        bridge?.registerPluginInstance(CalyxoNotificationPlugin())
        bridge?.registerPluginInstance(CalyxoLiveActivityPlugin())
        bridge?.registerPluginInstance(CalyxoWidgetPlugin())

        print("[CALYXO-INIT] ✅ Registered Calyxo native plugins: CalyxoHealthKit, CalyxoNotification, CalyxoLiveActivity, CalyxoWidget")
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
