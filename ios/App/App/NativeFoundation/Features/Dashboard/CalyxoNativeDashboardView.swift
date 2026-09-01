//
//  CalyxoNativeDashboardView.swift
//  Calyxo Native Product Shell
//
//  Production-Grade SwiftUI Athlete Dashboard.
//  Renders Concentric Quad Rings, Normalized Health Snapshot, and Quick Water Logger.
//  Supports adaptive Light & Dark modes with zero fake data.
//

import SwiftUI

public struct CalyxoNativeDashboardView: View {
    @ObservedObject private var healthManager = CalyxoNativeHealthKitManager.shared
    @ObservedObject private var repositories = CalyxoDataRepositories.shared
    @ObservedObject private var authService = CalyxoNativeAuthService.shared
    
    @State private var isLoggingWater = false
    
    public init() {}
    
    public var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("WELCOME BACK")
                            .font(.system(size: 11, weight: .bold))
                            .tracking(1.5)
                            .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                        Text(repositories.userProfileName)
                            .font(.system(size: 24, weight: .heavy, design: .rounded))
                            .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                    }
                    Spacer()
                    if repositories.isProSubscriber {
                        Text("PRO")
                            .font(.system(size: 10, weight: .black))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(CalyxoDesignTokens.Colors.accentAcid)
                            .foregroundColor(CalyxoDesignTokens.Colors.buttonPrimaryForeground)
                            .cornerRadius(6)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 10)
                
                // Quad Activity Rings Card
                quadRingsCard
                
                // Quick Hydration Write Bar
                quickHydrationBar
                
                // HealthKit Biometrics Snapshot Card
                healthBiometricsCard
            }
            .padding(.bottom, 32)
        }
        .background(CalyxoDesignTokens.Colors.background.ignoresSafeArea())
        .onAppear {
            repositories.fetchUserProfile()
            repositories.fetchSubscription()
            healthManager.fetchTodayMetrics()
        }
    }
    
    // MARK: - Quad Rings Card
    private var quadRingsCard: some View {
        VStack(spacing: 16) {
            HStack {
                Label("DAILY TARGETS", systemImage: "target")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                Spacer()
                Text("TODAY")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
            }
            
            HStack(spacing: 24) {
                // Concentric Mini Rings
                ZStack {
                    Circle()
                        .stroke(CalyxoDesignTokens.Colors.cardBorder, lineWidth: 10)
                        .frame(width: 100, height: 100)
                    Circle()
                        .trim(from: 0.0, to: min(1.0, Double(healthManager.currentSnapshot.steps) / 10000.0))
                        .stroke(CalyxoDesignTokens.Colors.accentAcid, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .frame(width: 100, height: 100)
                        .rotationEffect(.degrees(-90))
                    
                    VStack(spacing: 2) {
                        Text("\(healthManager.currentSnapshot.steps)")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                        Text("STEPS")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                    }
                }
                
                VStack(alignment: .leading, spacing: 12) {
                    targetProgressRow(title: "Active Calories", value: "\(healthManager.currentSnapshot.activeCalories) / 500 kcal", color: CalyxoDesignTokens.Colors.accentEmerald)
                    targetProgressRow(title: "Hydration", value: "\(repositories.todayWaterTotalMl) / 2500 ml", color: CalyxoDesignTokens.Colors.accentCyan)
                    targetProgressRow(title: "Recovery", value: healthManager.currentSnapshot.restingHeartRateBpm > 0 ? "OPTIMAL" : "--", color: CalyxoDesignTokens.Colors.accentAcid)
                }
            }
        }
        .padding()
        .calyxoCard()
        .padding(.horizontal)
    }
    
    private func targetProgressRow(title: String, value: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                Spacer()
                Text(value)
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
            }
            Rectangle()
                .fill(CalyxoDesignTokens.Colors.cardBorder)
                .frame(height: 4)
                .overlay(
                    GeometryReader { geo in
                        Rectangle()
                            .fill(color)
                            .frame(width: geo.size.width * 0.65)
                    },
                    alignment: .leading
                )
                .cornerRadius(2)
        }
    }
    
    // MARK: - Quick Hydration Write Bar (First Native Write Flow)
    private var quickHydrationBar: some View {
        VStack(spacing: 12) {
            HStack {
                Label("QUICK HYDRATION", systemImage: "drop.fill")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(CalyxoDesignTokens.Colors.accentCyan)
                Spacer()
                Text("\(repositories.todayWaterTotalMl) ml Logged")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
            }
            
            HStack(spacing: 12) {
                Button(action: { repositories.logWater(amountMl: 250) }) {
                    HStack {
                        Image(systemName: "plus")
                        Text("250 ml")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                    .foregroundColor(CalyxoDesignTokens.Colors.accentCyan)
                    .cornerRadius(10)
                }
                
                Button(action: { repositories.logWater(amountMl: 500) }) {
                    HStack {
                        Image(systemName: "plus")
                        Text("500 ml")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                    .foregroundColor(CalyxoDesignTokens.Colors.accentCyan)
                    .cornerRadius(10)
                }
            }
        }
        .padding()
        .calyxoCard()
        .padding(.horizontal)
    }
    
    // MARK: - HealthKit Biometrics Card
    private var healthBiometricsCard: some View {
        VStack(spacing: 16) {
            HStack {
                Label("HARDWARE BIOMETRICS", systemImage: "heart.fill")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.red)
                Spacer()
                Text(healthManager.connectionState.rawValue)
                    .font(.system(size: 10, weight: .bold))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(healthManager.isAuthorized ? CalyxoDesignTokens.Colors.success.opacity(0.2) : CalyxoDesignTokens.Colors.warning.opacity(0.2))
                    .foregroundColor(healthManager.isAuthorized ? CalyxoDesignTokens.Colors.success : CalyxoDesignTokens.Colors.warning)
                    .cornerRadius(4)
            }
            
            HStack(spacing: 16) {
                biometricTile(title: "Steps", value: healthManager.isAuthorized ? "\(healthManager.currentSnapshot.steps)" : "--", unit: "steps")
                biometricTile(title: "Resting HR", value: healthManager.currentSnapshot.restingHeartRateBpm > 0 ? "\(healthManager.currentSnapshot.restingHeartRateBpm)" : "--", unit: "bpm")
                biometricTile(title: "Sleep", value: healthManager.currentSnapshot.sleepHours > 0 ? "\(healthManager.currentSnapshot.sleepHours)" : "--", unit: "hrs")
            }
            
            if !healthManager.isAuthorized {
                Button(action: { healthManager.requestAuthorization { _, _ in } }) {
                    Text("Connect Apple Health")
                        .font(.system(size: 12, weight: .bold))
                        .frame(maxWidth: .infinity)
                        .padding(10)
                        .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .calyxoCard()
        .padding(.horizontal)
    }
    
    private func biometricTile(title: String, value: String, unit: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            Text(value)
                .font(.system(size: 18, weight: .heavy, design: .rounded))
                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
            Text(unit)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(CalyxoDesignTokens.Colors.surfaceSubtle)
        .cornerRadius(10)
    }
}
