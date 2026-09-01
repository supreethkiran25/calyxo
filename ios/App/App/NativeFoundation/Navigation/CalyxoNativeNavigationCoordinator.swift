//
//  CalyxoNativeNavigationCoordinator.swift
//  Calyxo Native Product Shell
//
//  Native Tab & Navigation Stack Coordinator.
//  Binds Deep-Link routing, Authentication state, and Tab transitions.
//

import SwiftUI

public struct CalyxoNativeNavigationCoordinator: View {
    @ObservedObject private var authService = CalyxoNativeAuthService.shared
    @ObservedObject private var deepLinkHandler = CalyxoNativeDeepLinkHandler.shared
    
    @State private var selectedTab: TabItem = .dashboard
    
    public enum TabItem: Int, Hashable {
        case dashboard = 0
        case workout = 1
        case nutrition = 2
        case profile = 3
    }
    
    public init() {}
    
    public var body: some View {
        ZStack {
            if authService.isAuthenticated {
                authenticatedTabShell
            } else {
                CalyxoNativeAppShell()
            }
        }
        .onReceive(deepLinkHandler.$activeRoute) { route in
            switch route {
            case .dashboard:
                selectedTab = .dashboard
            case .workout:
                selectedTab = .workout
            case .nutrition, .quickHydrate:
                selectedTab = .nutrition
            default:
                break
            }
        }
    }
    
    private var authenticatedTabShell: some View {
        TabView(selection: $selectedTab) {
            NavigationView {
                CalyxoNativeDashboardView()
                    .navigationBarHidden(true)
            }
            .tabItem {
                Label("Dashboard", systemImage: "square.grid.2x2.fill")
            }
            .tag(TabItem.dashboard)
            
            NavigationView {
                CalyxoNativeWorkoutView()
                    .navigationBarHidden(true)
            }
            .tabItem {
                Label("Workout", systemImage: "dumbbell.fill")
            }
            .tag(TabItem.workout)
            
            NavigationView {
                CalyxoNativeNutritionView()
                    .navigationBarHidden(true)
            }
            .tabItem {
                Label("Nutrition", systemImage: "fork.knife")
            }
            .tag(TabItem.nutrition)
            
            NavigationView {
                CalyxoNativeProfileView()
                    .navigationBarHidden(true)
            }
            .tabItem {
                Label("Profile", systemImage: "person.crop.circle.fill")
            }
            .tag(TabItem.profile)
        }
        .accentColor(CalyxoDesignTokens.Colors.accentAcid)
    }
}
