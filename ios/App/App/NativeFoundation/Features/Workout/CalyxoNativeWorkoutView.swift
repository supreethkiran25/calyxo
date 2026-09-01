//
//  CalyxoNativeWorkoutView.swift
//  Calyxo Native Workout Experience
//
//  Production-Grade SwiftUI Active Workout Logger.
//  Real-time volume calculation, interactive set logging, and native rest timer HUD.
//  Supports adaptive Light & Dark mode contrast.
//

import SwiftUI

public struct CalyxoNativeWorkoutView: View {
    @ObservedObject private var engine = CalyxoNativeWorkoutEngine.shared
    @State private var showingFinishAlert = false
    
    public init() {}
    
    public var body: some View {
        ZStack {
            CalyxoDesignTokens.Colors.background.ignoresSafeArea()
            
            if let session = engine.activeSession {
                activeWorkoutView(session: session)
            } else {
                startWorkoutPromptView
            }
        }
    }
    
    // MARK: - Start Workout Prompt
    private var startWorkoutPromptView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: "dumbbell.fill")
                .font(.system(size: 64))
                .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
            
            VStack(spacing: 8) {
                Text("READY TO TRAIN?")
                    .font(.system(size: 24, weight: .black, design: .rounded))
                    .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                Text("Select a workout routine or start an empty training session.")
                    .font(.system(size: 14))
                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            
            Button(action: { engine.startSession() }) {
                HStack {
                    Image(systemName: "play.fill")
                    Text("Start Push Workout A")
                        .fontWeight(.bold)
                }
                .font(.system(size: 16))
                .frame(maxWidth: .infinity)
                .padding()
                .background(CalyxoDesignTokens.Colors.accentAcid)
                .foregroundColor(CalyxoDesignTokens.Colors.buttonPrimaryForeground)
                .cornerRadius(12)
            }
            .padding(.horizontal, 32)
            
            Spacer()
        }
    }
    
    // MARK: - Active Workout View
    private func activeWorkoutView(session: CalyxoNativeWorkoutEngine.WorkoutSession) -> some View {
        VStack(spacing: 0) {
            // Live Session Header & HUD
            VStack(spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(session.title.uppercased())
                            .font(.system(size: 11, weight: .bold))
                            .tracking(1.5)
                            .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                        Text("Active Training")
                            .font(.system(size: 20, weight: .heavy, design: .rounded))
                            .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                    }
                    Spacer()
                    Button(action: { showingFinishAlert = true }) {
                        Text("Finish")
                            .font(.system(size: 13, weight: .bold))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(CalyxoDesignTokens.Colors.accentAcid)
                            .foregroundColor(CalyxoDesignTokens.Colors.buttonPrimaryForeground)
                            .cornerRadius(8)
                    }
                }
                
                // Volume & Set Stats Ticker
                HStack(spacing: 16) {
                    statBadge(title: "TOTAL VOLUME", value: "\(Int(session.totalVolumeKg)) kg")
                    statBadge(title: "COMPLETED SETS", value: "\(session.completedSetCount)")
                    statBadge(title: "INTENSITY", value: session.category)
                }
            }
            .padding()
            .background(CalyxoDesignTokens.Colors.surface)
            
            // Rest Timer Active Banner
            if engine.isRestTimerActive {
                HStack {
                    Image(systemName: "timer")
                        .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                    Text("REST: \(engine.restRemainingSeconds)s")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                    Spacer()
                    Button(action: { engine.stopRestTimer() }) {
                        Text("Skip")
                            .font(.caption)
                            .fontWeight(.bold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                            .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                            .cornerRadius(6)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 10)
                .background(CalyxoDesignTokens.Colors.accentAcid.opacity(0.15))
            }
            
            // Exercise Set List
            ScrollView {
                VStack(spacing: 16) {
                    ForEach(session.exercises) { exercise in
                        exerciseCard(exercise: exercise)
                    }
                }
                .padding()
                .padding(.bottom, 40)
            }
        }
        .alert(isPresented: $showingFinishAlert) {
            Alert(
                title: Text("Finish Workout?"),
                message: Text("Total volume logged: \(Int(session.totalVolumeKg)) kg across \(session.completedSetCount) completed sets."),
                primaryButton: .default(Text("Save & Finish")) {
                    engine.finishWorkout()
                },
                secondaryButton: .cancel()
            )
        }
    }
    
    // MARK: - Exercise Card
    private func exerciseCard(exercise: CalyxoNativeWorkoutEngine.WorkoutExercise) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(exercise.name)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                    Text(exercise.category.uppercased())
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                }
                Spacer()
                Button(action: { engine.addSet(to: exercise.id) }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(CalyxoDesignTokens.Colors.accentAcid)
                        .font(.system(size: 20))
                }
            }
            
            // Set Table Header
            HStack {
                Text("SET").frame(width: 35, alignment: .leading)
                Text("KG").frame(width: 70, alignment: .center)
                Text("REPS").frame(width: 70, alignment: .center)
                Spacer()
                Text("DONE").frame(width: 45, alignment: .trailing)
            }
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            
            // Sets Rows
            ForEach(exercise.sets) { s in
                HStack {
                    Text("\(s.setNumber)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                        .frame(width: 35, alignment: .leading)
                    
                    Text("\(Int(s.weightKg))")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                        .frame(width: 70, alignment: .center)
                    
                    Text("\(s.reps)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                        .frame(width: 70, alignment: .center)
                    
                    Spacer()
                    
                    Button(action: { engine.completeSet(exerciseId: exercise.id, setId: s.id) }) {
                        Image(systemName: s.isCompleted ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 22))
                            .foregroundColor(s.isCompleted ? CalyxoDesignTokens.Colors.accentAcid : CalyxoDesignTokens.Colors.textSecondary)
                    }
                    .frame(width: 45, alignment: .trailing)
                }
                .padding(.vertical, 4)
            }
        }
        .padding()
        .calyxoCard()
    }
    
    private func statBadge(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
            Text(value)
                .font(.system(size: 14, weight: .heavy, design: .rounded))
                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
