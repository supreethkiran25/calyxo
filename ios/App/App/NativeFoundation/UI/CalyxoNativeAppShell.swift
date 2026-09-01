//
//  CalyxoNativeAppShell.swift
//  Calyxo Native Foundation
//
//  Minimal Native SwiftUI App Shell.
//  Validates launch, authentication, Keychain session restoration, and HealthKit baseline.
//  Supports adaptive Light & Dark modes with zero fake data.
//

import SwiftUI

public struct CalyxoNativeAppShell: View {
    @ObservedObject private var authService = CalyxoNativeAuthService.shared
    @ObservedObject private var healthManager = CalyxoNativeHealthKitManager.shared
    @ObservedObject private var deepLinkHandler = CalyxoNativeDeepLinkHandler.shared
    
    @State private var emailInput: String = ""
    @State private var passwordInput: String = ""
    @State private var isLoading: Bool = false
    
    public init() {}
    
    public var body: some View {
        ZStack {
            CalyxoDesignTokens.Colors.background.ignoresSafeArea()
            
            if authService.isAuthenticated, let session = authService.currentSession {
                authenticatedDashboard(session: session)
            } else {
                loginView
            }
        }
        .onOpenURL { url in
            deepLinkHandler.handle(url: url)
        }
    }
    
    // MARK: - Login View
    private var loginView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            VStack(spacing: 8) {
                Text("CALYXO")
                    .font(.system(size: 32, weight: .black, design: .rounded))
                    .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                    .tracking(3)
                
                Text("Native Athlete Shell")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            }
            
            VStack(spacing: 16) {
                TextField("Email", text: $emailInput)
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .padding()
                    .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                    .cornerRadius(12)
                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                
                SecureField("Password", text: $passwordInput)
                    .textContentType(.password)
                    .padding()
                    .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                    .cornerRadius(12)
                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                
                if let error = authService.authError {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
                
                Button(action: executeLogin) {
                    HStack {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .black))
                        } else {
                            Text("Sign In")
                                .font(.system(size: 16, weight: .bold))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(CalyxoDesignTokens.Colors.accentAcid)
                    .foregroundColor(CalyxoDesignTokens.Colors.buttonPrimaryForeground)
                    .cornerRadius(12)
                }
                .disabled(isLoading || emailInput.isEmpty || passwordInput.isEmpty)
            }
            .padding(.horizontal, 32)
            
            Spacer()
        }
    }
    
    // MARK: - Authenticated Dashboard
    private func authenticatedDashboard(session: CalyxoKeychainStorage.StoredSession) -> some View {
        VStack(spacing: 24) {
            HStack {
                VStack(alignment: .leading) {
                    Text("ATHLETE PROFILE")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                    Text(session.userEmail)
                        .font(.title3)
                        .fontWeight(.heavy)
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                }
                Spacer()
                Button(action: { authService.signOut() }) {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                        .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                        .padding(8)
                }
            }
            .padding(.horizontal)
            .padding(.top)
            
            // HealthKit Metric Snapshot Card
            VStack(spacing: 16) {
                HStack {
                    Label("Apple HealthKit", systemImage: "heart.fill")
                        .font(.headline)
                        .foregroundColor(.red)
                    Spacer()
                    Text(healthManager.connectionState.rawValue)
                        .font(.caption)
                        .fontWeight(.bold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(healthManager.isAuthorized ? Color.green.opacity(0.2) : Color.orange.opacity(0.2))
                        .foregroundColor(healthManager.isAuthorized ? .green : .orange)
                        .cornerRadius(6)
                }
                
                HStack(spacing: 20) {
                    metricItem(title: "Steps", value: "\(healthManager.currentSnapshot.steps)")
                    metricItem(title: "Active Cals", value: "\(healthManager.currentSnapshot.activeCalories) kcal")
                    metricItem(title: "RHR", value: healthManager.currentSnapshot.restingHeartRateBpm > 0 ? "\(healthManager.currentSnapshot.restingHeartRateBpm) bpm" : "--")
                }
                
                if !healthManager.isAuthorized {
                    Button(action: { healthManager.requestAuthorization { _, _ in } }) {
                        Text("Connect Apple Health")
                            .font(.caption)
                            .fontWeight(.bold)
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
            
            Spacer()
        }
    }
    
    private func metricItem(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption2)
                .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            Text(value)
                .font(.subheadline)
                .fontWeight(.bold)
                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
        }
        .frame(maxWidth: .infinity)
    }
    
    private func executeLogin() {
        isLoading = true
        authService.signIn(email: emailInput, password: passwordInput) { _ in
            DispatchQueue.main.async {
                self.isLoading = false
            }
        }
    }
}
