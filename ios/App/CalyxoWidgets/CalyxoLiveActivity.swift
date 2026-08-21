import ActivityKit
import WidgetKit
import SwiftUI

// Flagship Calyxo Live Activity UI — Dynamic Island & Lock Screen
// Native ActivityKit system-driven timers for zero-drift background & lock screen tracking.

@available(iOS 16.1, *)
struct CalyxoLiveActivityWidget: Widget {

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: CalyxoActivityAttributes.self) { context in
            // Lock Screen / Notification Center Banner View
            lockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // ── Expanded Dynamic Island View ──────────────────────────────
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 8) {
                        Image(systemName: "figure.run")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(context.state.isResting ? Self.brandCyan : Self.brandGreen)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(context.state.exerciseName.isEmpty ? context.state.workoutName : context.state.exerciseName)
                                .font(.system(size: 14, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                                .lineLimit(1)

                            Text("Set \(context.state.currentSet) of \(context.state.totalSets) • \(context.state.currentReps) reps")
                                .font(.system(size: 11, weight: .bold, design: .monospaced))
                                .foregroundColor(Color(white: 0.7))
                        }
                    }
                    .padding(.leading, 4)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(context.state.isResting ? "REST TIMER" : "SESSION TIME")
                            .font(.system(size: 9, weight: .black))
                            .tracking(0.5)
                            .foregroundColor(context.state.isResting ? Self.brandCyan : Self.brandGreen)

                        if context.state.isResting, let restEnd = context.state.restEndDate {
                            Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                                .monospacedDigit()
                                .font(.system(size: 18, weight: .black, design: .rounded))
                                .foregroundColor(Self.brandCyan)
                        } else {
                            Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                                .monospacedDigit()
                                .font(.system(size: 18, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.trailing, 4)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 8) {
                        // Segmented Set Progress Bar
                        HStack(spacing: 4) {
                            ForEach(0..<max(1, context.state.totalSets), id: \.self) { idx in
                                let setNum = idx + 1
                                let isDone = setNum < context.state.currentSet
                                let isCurrent = setNum == context.state.currentSet

                                Capsule()
                                    .fill(
                                        isDone ? Self.brandGreen :
                                        isCurrent ? (context.state.isResting ? Self.brandCyan : Self.brandGreen) :
                                        Color(white: 0.2)
                                    )
                                    .frame(height: 3)
                            }
                        }

                        // Bottom Actions Row
                        HStack {
                            if context.state.caloriesBurned > 0 {
                                Label("\(context.state.caloriesBurned) kcal", systemImage: "flame.fill")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.orange)
                            } else {
                                Text(context.state.isPaused ? "PAUSED" : context.state.isResting ? "RESTING" : "● LIVE")
                                    .font(.system(size: 10, weight: .black))
                                    .foregroundColor(context.state.isPaused ? .orange : context.state.isResting ? Self.brandCyan : Self.brandGreen)
                            }

                            Spacer()

                            // Action Buttons
                            HStack(spacing: 6) {
                                if context.state.isResting {
                                    Link(destination: URL(string: "calyxo://workout/skip-rest")!) {
                                        HStack(spacing: 3) {
                                            Image(systemName: "forward.fill")
                                                .font(.system(size: 10, weight: .bold))
                                            Text("SKIP REST")
                                                .font(.system(size: 9, weight: .black))
                                        }
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Self.brandCyan)
                                        .foregroundColor(.black)
                                        .clipShape(Capsule())
                                    }
                                } else {
                                    Link(destination: URL(string: "calyxo://workout/complete-set")!) {
                                        HStack(spacing: 3) {
                                            Image(systemName: "checkmark")
                                                .font(.system(size: 10, weight: .bold))
                                            Text("LOG SET")
                                                .font(.system(size: 9, weight: .black))
                                        }
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Self.brandGreen)
                                        .foregroundColor(.black)
                                        .clipShape(Capsule())
                                    }
                                }

                                Link(destination: URL(string: "calyxo://workout/toggle-pause")!) {
                                    Image(systemName: context.state.isPaused ? "play.fill" : "pause.fill")
                                        .font(.system(size: 10, weight: .bold))
                                        .padding(5)
                                        .background(Color(white: 0.15))
                                        .foregroundColor(.white)
                                        .clipShape(Circle())
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 4)
                    .padding(.top, 4)
                }
            } compactLeading: {
                HStack(spacing: 5) {
                    Image(systemName: "figure.run")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(context.state.isResting ? Self.brandCyan : Self.brandGreen)
                    Text("WORKOUT")
                        .font(.system(size: 9, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                }
                .padding(.leading, 4)
            } compactTrailing: {
                HStack(spacing: 4) {
                    if context.state.isResting, let restEnd = context.state.restEndDate {
                        Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                            .monospacedDigit()
                            .font(.system(size: 12, weight: .black, design: .rounded))
                            .foregroundColor(Self.brandCyan)
                    } else {
                        Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                            .monospacedDigit()
                            .font(.system(size: 12, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                    }
                }
                .padding(.trailing, 4)
            } minimal: {
                Image(systemName: "figure.run")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(context.state.isResting ? Self.brandCyan : Self.brandGreen)
            }
        }
    }

    // MARK: - Lock Screen Banner View
    @ViewBuilder
    private func lockScreenView(context: ActivityViewContext<CalyxoActivityAttributes>) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header Row: CALYXO • Workout Name • Status
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(context.state.isResting ? Self.brandCyan : context.state.isPaused ? Color.orange : Self.brandGreen)
                        .frame(width: 7, height: 7)

                    Text("CALYXO")
                        .font(.system(size: 11, weight: .black, design: .rounded))
                        .tracking(1.0)
                        .foregroundColor(Color(white: 0.6))

                    Text("•")
                        .foregroundColor(Color(white: 0.4))

                    Text(context.state.workoutName.uppercased())
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(1)
                }

                Spacer()

                Text(context.state.isPaused ? "PAUSED" : context.state.isResting ? "RESTING" : "ACTIVE")
                    .font(.system(size: 9, weight: .black))
                    .tracking(0.5)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2.5)
                    .background(
                        (context.state.isPaused ? Color.orange : context.state.isResting ? Self.brandCyan : Self.brandGreen).opacity(0.18)
                    )
                    .foregroundColor(
                        context.state.isPaused ? .orange : context.state.isResting ? Self.brandCyan : Self.brandGreen
                    )
                    .clipShape(Capsule())
            }

            // Main Info Row: Exercise, Set and Live Big Timer
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(context.state.exerciseName.isEmpty ? context.state.workoutName : context.state.exerciseName)
                        .font(.system(size: 17, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(1)

                    Text("Set \(context.state.currentSet) of \(context.state.totalSets) • \(context.state.currentReps) reps")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(white: 0.65))
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 1) {
                    Text(context.state.isResting ? "REST REMAINING" : "ELAPSED")
                        .font(.system(size: 8.5, weight: .black))
                        .tracking(0.5)
                        .foregroundColor(context.state.isResting ? Self.brandCyan : Color(white: 0.6))

                    if context.state.isResting, let restEnd = context.state.restEndDate {
                        Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                            .monospacedDigit()
                            .font(.system(size: 24, weight: .black, design: .rounded))
                            .foregroundColor(Self.brandCyan)
                    } else {
                        Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                            .monospacedDigit()
                            .font(.system(size: 24, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                    }
                }
            }

            // Segmented Progress Line
            HStack(spacing: 3) {
                ForEach(0..<max(1, context.state.totalSets), id: \.self) { idx in
                    let setNum = idx + 1
                    let isDone = setNum < context.state.currentSet
                    let isCurrent = setNum == context.state.currentSet

                    Capsule()
                        .fill(
                            isDone ? Self.brandGreen :
                            isCurrent ? (context.state.isResting ? Self.brandCyan : Self.brandGreen) :
                            Color(white: 0.2)
                        )
                        .frame(height: 3)
                }
            }

            // Quick Actions & Telemetry Footer
            HStack {
                if context.state.caloriesBurned > 0 {
                    Label("\(context.state.caloriesBurned) kcal", systemImage: "flame.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.orange)
                } else if context.state.heartRate > 0 {
                    Label("\(context.state.heartRate) bpm", systemImage: "heart.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.red)
                }

                Spacer()

                // Interactive Buttons
                HStack(spacing: 8) {
                    if context.state.isResting {
                        Link(destination: URL(string: "calyxo://workout/skip-rest")!) {
                            HStack(spacing: 4) {
                                Image(systemName: "forward.fill")
                                    .font(.system(size: 11, weight: .bold))
                                Text("SKIP REST")
                                    .font(.system(size: 10, weight: .black))
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Self.brandCyan)
                            .foregroundColor(.black)
                            .clipShape(Capsule())
                        }
                    } else {
                        Link(destination: URL(string: "calyxo://workout/complete-set")!) {
                            HStack(spacing: 4) {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 11, weight: .bold))
                                Text("LOG SET")
                                    .font(.system(size: 10, weight: .black))
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Self.brandGreen)
                            .foregroundColor(.black)
                            .clipShape(Capsule())
                        }
                    }

                    Link(destination: URL(string: "calyxo://workout/toggle-pause")!) {
                        Image(systemName: context.state.isPaused ? "play.fill" : "pause.fill")
                            .font(.system(size: 12, weight: .bold))
                            .padding(6)
                            .background(Color(white: 0.15))
                            .foregroundColor(.white)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 13)
        .background(Color(red: 10/255, green: 10/255, blue: 12/255))
    }

    private static let brandGreen = Color(red: 46/255, green: 204/255, blue: 113/255)
    private static let brandCyan = Color(red: 0/255, green: 240/255, blue: 255/255)
}
