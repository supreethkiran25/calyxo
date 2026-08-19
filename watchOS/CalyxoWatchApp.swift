import SwiftUI
import HealthKit
import WatchConnectivity

@main
struct CalyxoWatchApp: App {
    @StateObject private var connectivityManager = WatchConnectivityManager.shared

    var body: some Scene {
        WindowGroup {
            TabView {
                WorkoutTrackingView()
                    .tabItem {
                        Label("Workout", systemImage: "figure.run")
                    }

                HydrationTrackingView()
                    .tabItem {
                        Label("Hydration", systemImage: "drop.fill")
                    }

                HeartRateView()
                    .tabItem {
                        Label("Heart Rate", systemImage: "heart.fill")
                    }
            }
            .accentColor(Color(red: 16/255, green: 185/255, blue: 129/255))
        }
    }
}
