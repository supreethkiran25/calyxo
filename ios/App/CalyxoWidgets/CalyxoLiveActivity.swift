import ActivityKit
import WidgetKit
import SwiftUI

// Live Activity UI — renders on Lock Screen and Dynamic Island.
// Uses native system-driven timer intervals so countdowns continue ticking
// even when the app is in the background or device is locked.

@available(iOS 16.1, *)
struct CalyxoLiveActivityWidget: Widget {

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: CalyxoActivityAttributes.self) { context in
            // Lock Screen / Notification Center Banner View
            lockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded Dynamic Island View (on long press)
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 8) {
                        Circle()
                            .fill(context.state.isResting ? Self.brandCyan : Self.brandGreen)
                            .frame(width: 8, height: 8)
                            .shadow(color: (context.state.isResting ? Self.brandCyan : Self.brandGreen).opacity(0.8), radius: 4)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(context.state.exerciseName.isEmpty ? context.state.workoutName : context.state.exerciseName)
                                .font(.system(size: 14, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Text("Set \(context.state.currentSet) of \(context.state.totalSets) • \(context.state.currentReps) reps")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(Color(white: 0.65))
                        }
                    }
                    .padding(.leading, 6)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        if context.state.isResting, let restEnd = context.state.restEndDate {
                            Text("REST TIMER")
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(Self.brandCyan)
                            Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                                .monospacedDigit()
                                .font(.system(size: 16, weight: .black, design: .rounded))
                                .foregroundColor(Self.brandCyan)
                        } else {
                            Text("ACTIVE TIME")
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(Self.brandGreen)
                            Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                                .monospacedDigit()
                                .font(.system(size: 16, weight: .black, design: .rounded))
                                .foregroundColor(Self.brandGreen)
                        }
                    }
                    .padding(.trailing, 6)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 8) {
                        // Running animated progress beam line across the bottom of the Island
                        if context.state.isResting, let restEnd = context.state.restEndDate {
                            ProgressView(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                                .tint(Self.brandCyan)
                                .scaleEffect(x: 1, y: 0.8, anchor: .center)
                        } else {
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        colors: [Self.brandGreen.opacity(0.3), Self.brandCyan, Self.brandGreen],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(height: 2)
                        }

                        HStack(alignment: .center) {
                            if context.state.caloriesBurned > 0 {
                                Label("\(context.state.caloriesBurned) kcal", systemImage: "flame.fill")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.orange)
                            } else {
                                Label("Paced Set", systemImage: "bolt.fill")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(Self.brandGreen)
                            }

                            Spacer()

                            if context.state.heartRate > 0 {
                                Label("\(context.state.heartRate) bpm", systemImage: "heart.fill")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.red)
                            }

                            Spacer()

                            Text(context.state.isPaused ? "PAUSED" : context.state.isResting ? "RESTING" : "ACTIVE")
                                .font(.system(size: 9, weight: .black))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(
                                    (context.state.isPaused ? Color.orange : context.state.isResting ? Self.brandCyan : Self.brandGreen).opacity(0.2)
                                )
                                .foregroundColor(
                                    context.state.isPaused ? .orange : context.state.isResting ? Self.brandCyan : Self.brandGreen
                                )
                                .cornerRadius(6)
                        }
                    }
                    .padding(.top, 4)
                    .padding(.horizontal, 6)
                }
            } compactLeading: {
                // Sleek pulsing dot instead of hourglass
                HStack(spacing: 4) {
                    Circle()
                        .fill(context.state.isResting ? Self.brandCyan : Self.brandGreen)
                        .frame(width: 7, height: 7)
                        .shadow(color: (context.state.isResting ? Self.brandCyan : Self.brandGreen).opacity(0.8), radius: 3)
                    Image(systemName: context.state.isResting ? "waveform.path" : "dumbbell.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(context.state.isResting ? Self.brandCyan : Self.brandGreen)
                }
                .padding(.leading, 2)
            } compactTrailing: {
                if context.state.isResting, let restEnd = context.state.restEndDate {
                    Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                        .monospacedDigit()
                        .font(.system(size: 12, weight: .black, design: .rounded))
                        .foregroundColor(Self.brandCyan)
                } else {
                    Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                        .monospacedDigit()
                        .font(.system(size: 12, weight: .black, design: .rounded))
                        .foregroundColor(Self.brandGreen)
                }
            } minimal: {
                Circle()
                    .fill(context.state.isResting ? Self.brandCyan : Self.brandGreen)
                    .frame(width: 8, height: 8)
                    .shadow(color: (context.state.isResting ? Self.brandCyan : Self.brandGreen).opacity(0.9), radius: 4)
            }
        }
    }

    // MARK: - Lock Screen View
    @ViewBuilder
    private func lockScreenView(context: ActivityViewContext<CalyxoActivityAttributes>) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header Row
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(context.state.isResting ? Self.brandCyan : Self.brandGreen)
                        .frame(width: 8, height: 8)
                        .shadow(color: (context.state.isResting ? Self.brandCyan : Self.brandGreen).opacity(0.8), radius: 3)

                    Text("CALYXO ACTIVE")
                        .font(.system(size: 11, weight: .black, design: .rounded))
                        .foregroundColor(context.state.isResting ? Self.brandCyan : Self.brandGreen)
                }
                Spacer()
                Text(context.state.isPaused ? "PAUSED" : context.state.isResting ? "RESTING" : "ACTIVE")
                    .font(.system(size: 10, weight: .black))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(
                        (context.state.isPaused ? Color.orange : context.state.isResting ? Self.brandCyan : Self.brandGreen).opacity(0.2)
                    )
                    .foregroundColor(
                        context.state.isPaused ? .orange : context.state.isResting ? Self.brandCyan : Self.brandGreen
                    )
                    .cornerRadius(6)
            }

            // Exercise & Metrics Row
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(context.state.exerciseName.isEmpty ? context.state.workoutName : context.state.exerciseName)
                        .font(.system(size: 17, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("Set \(context.state.currentSet) of \(context.state.totalSets) • \(context.state.currentReps) reps")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(Color(white: 0.65))
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    if context.state.isResting, let restEnd = context.state.restEndDate {
                        Text("REST")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(Self.brandCyan)
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
                    if context.state.caloriesBurned > 0 {
                        Text("\(context.state.caloriesBurned) kcal")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.orange)
                    }
                }
            }

            // Continuous Running Progress Line
            if context.state.isResting, let restEnd = context.state.restEndDate {
                ProgressView(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                    .tint(Self.brandCyan)
                    .scaleEffect(x: 1, y: 0.8, anchor: .center)
            } else {
                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [Self.brandGreen.opacity(0.3), Self.brandCyan, Self.brandGreen],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(height: 2)
            }
        }
        .padding(14)
        .background(Color(red: 10/255, green: 10/255, blue: 12/255))
    }

    private static let brandGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
    private static let brandCyan = Color(red: 0/255, green: 240/255, blue: 255/255)
}
