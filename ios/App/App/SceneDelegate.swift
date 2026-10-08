import UIKit
import Capacitor

/// Dedicated native plugin to ensure status bar, dynamic island, and backing layers
/// match the active app theme (light or dark) without black letterboxing or overlays.
@objc(CalyxoThemePlugin)
public class CalyxoThemePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalyxoThemePlugin"
    public let jsName = "CalyxoTheme"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setTheme", returnType: CAPPluginReturnPromise)
    ]

    @objc func setTheme(_ call: CAPPluginCall) {
        let hex = call.getString("hex") ?? "#0A0A0C"
        let isLight = call.getBool("isLight") ?? false

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let color = UIColor.capacitor.color(fromHex: hex) ?? (isLight ? UIColor(red: 248/255.0, green: 250/255.0, blue: 252/255.0, alpha: 1.0) : UIColor(red: 10/255.0, green: 10/255.0, blue: 12/255.0, alpha: 1.0))

            // Sync window and root view backgrounds
            let win = self.bridge?.viewController?.view.window ?? UIApplication.shared.windows.first
            win?.backgroundColor = color
            self.bridge?.viewController?.view.backgroundColor = color

            // Sync webView backing layer and underPageBackgroundColor
            if let webView = self.bridge?.webView {
                webView.backgroundColor = color
                webView.scrollView.backgroundColor = color
                if #available(iOS 15.0, *) {
                    webView.underPageBackgroundColor = color
                }
            }

            // Sync status bar icon contrast: .darkContent for light theme, .lightContent for dark theme
            self.bridge?.statusBarStyle = isLight ? .darkContent : .lightContent
            self.bridge?.viewController?.setNeedsStatusBarAppearanceUpdate()

            call.resolve()
        }
    }
}

/// Custom CAPBridgeViewController that explicitly registers all Calyxo native plugins
/// with Capacitor's bridge upon WebView initialization.
class MainViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Edge-to-edge configuration: WebKit must not be forced opaque or letterboxed
        self.webView?.isOpaque = false
        self.webView?.backgroundColor = .clear
        self.webView?.scrollView.backgroundColor = .clear
        self.webView?.scrollView.contentInsetAdjustmentBehavior = .never
        self.webView?.scrollView.bounces = false
        if #available(iOS 15.0, *) {
            self.webView?.underPageBackgroundColor = .clear
        }

        // Initial cold boot background: #050606 to match the cinematic splash screen
        self.view.backgroundColor = UIColor(red: 5/255.0, green: 6/255.0, blue: 6/255.0, alpha: 1.0)
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return self.bridge?.statusBarStyle ?? .lightContent
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // Ensure webView always covers the entire screen edge-to-edge behind Dynamic Island & status bar
        guard let window = self.view.window ?? UIApplication.shared.windows.first else { return }
        let fullBounds = window.bounds
        if self.view.frame != fullBounds {
            self.view.frame = fullBounds
        }
        if let webView = self.webView, webView.frame != fullBounds {
            webView.frame = fullBounds
        }

        // Strip or hide any opaque overlay views placed directly over the status bar by legacy plugin observers
        for subview in self.view.subviews {
            if subview !== self.webView && subview.frame.origin.y <= 0 && subview.frame.height <= 80 {
                subview.isHidden = true
                subview.removeFromSuperview()
            }
        }
        for subview in window.subviews {
            if subview !== self.view && subview !== self.webView && subview.frame.origin.y <= 0 && subview.frame.height <= 80 {
                subview.isHidden = true
                subview.removeFromSuperview()
            }
        }
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()

        // Register custom native plugins directly with Capacitor bridge
        bridge?.registerPluginInstance(CalyxoThemePlugin())
        bridge?.registerPluginInstance(CalyxoHealthKitPlugin())
        bridge?.registerPluginInstance(CalyxoBLEPlugin())
        bridge?.registerPluginInstance(CalyxoNotificationPlugin())
        bridge?.registerPluginInstance(CalyxoLiveActivityPlugin())
        bridge?.registerPluginInstance(CalyxoWidgetPlugin())

        print("[CALYXO-INIT] ✅ Registered Calyxo native plugins: CalyxoTheme, CalyxoHealthKit, CalyxoBLE, CalyxoNotification, CalyxoLiveActivity, CalyxoWidget")
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.backgroundColor = UIColor(red: 5/255.0, green: 6/255.0, blue: 6/255.0, alpha: 1.0)
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
