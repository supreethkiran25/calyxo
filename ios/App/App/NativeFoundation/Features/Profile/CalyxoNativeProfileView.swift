//
//  CalyxoNativeProfileView.swift
//  Calyxo Native Product Shell
//
//  Production-Grade SwiftUI Athlete Profile & Subscription Details.
//  Renders verified subscription timeline (Next billing date / Expiry date),
//  measurement units, and account security.
//

import SwiftUI

public struct CalyxoNativeProfileView: View {
    @ObservedObject private var authService = CalyxoNativeAuthService.shared
    @ObservedObject private var repositories = CalyxoDataRepositories.shared
    
    public init() {}
    
    public var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Profile Avatar & Name Card
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(CalyxoDesignTokens.Colors.surfaceSubtle)
                            .frame(width: 80, height: 80)
                        Image(systemName: "person.fill")
                            .font(.system(size: 36))
                            .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                    }
                    
                    VStack(spacing: 4) {
                        Text(repositories.userProfileName)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                        Text(authService.currentSession?.userEmail ?? "athlete@calyxo.app")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                    }
                    
                    if repositories.isProSubscriber {
                        HStack(spacing: 4) {
                            Image(systemName: "crown.fill")
                                .font(.system(size: 10))
                            Text("PRO ATHLETE SUBSCRIBER")
                                .font(.system(size: 10, weight: .black))
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(CalyxoDesignTokens.Colors.accentAcid.opacity(0.15))
                        .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                        .cornerRadius(6)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
                .calyxoCard()
                .padding(.horizontal)
                .padding(.top, 10)
                
                // Subscription Details Card
                subscriptionDetailsCard
                
                // Account Settings List
                VStack(spacing: 1) {
                    profileRow(title: "Units & Measurements", value: "Metric (kg/cm)")
                    profileRow(title: "Calorie Calculation Engine", value: "Mifflin-St Jeor")
                    profileRow(title: "Connected Wearables", value: "Apple Watch")
                    profileRow(title: "App Version", value: "2.4.0 (Native)")
                }
                .calyxoCard()
                .padding(.horizontal)
                
                // Sign Out Action Button
                Button(action: { authService.signOut() }) {
                    HStack {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Sign Out")
                            .fontWeight(.bold)
                    }
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .calyxoCard()
                }
                .padding(.horizontal)
            }
            .padding(.bottom, 32)
        }
        .background(CalyxoDesignTokens.Colors.background.ignoresSafeArea())
        .onAppear {
            repositories.fetchUserProfile()
            repositories.fetchSubscription()
        }
    }
    
    // MARK: - Subscription Details Card
    private var subscriptionDetailsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("MEMBERSHIP & BILLING", systemImage: "creditcard.fill")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                Spacer()
                Text(repositories.isProSubscriber ? "ACTIVE" : "FREE")
                    .font(.system(size: 10, weight: .bold))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(repositories.isProSubscriber ? Color.green.opacity(0.15) : Color.gray.opacity(0.15))
                    .foregroundColor(repositories.isProSubscriber ? .green : .gray)
                    .cornerRadius(4)
            }
            
            if let sub = repositories.subscriptionInfo {
                VStack(spacing: 8) {
                    timelineRow(label: "Current Plan", value: sub.planName)
                    if let timeline = sub.timelineDisplay {
                        timelineRow(label: timeline.title, value: timeline.dateString)
                    }
                }
            } else {
                Text("Free tier. Upgrade to Calyxo Pro for unlimited AI intelligence, wearable bio-sync & deep recovery modeling.")
                    .font(.system(size: 12))
                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            }
        }
        .padding()
        .calyxoCard()
        .padding(.horizontal)
    }
    
    private func timelineRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            Spacer()
            Text(value)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
        }
    }
    
    private func profileRow(title: String, value: String) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
            Spacer()
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
        }
        .padding()
    }
}
