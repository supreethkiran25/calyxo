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
                    HStack(spacing: 6) {
                        Image(systemName: context.state.isResting ? "hourglass" : "dumbbell.fill")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(context.state.isResting ? .cyan : Self.brandGreen)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(context.state.exerciseName.isEmpty ? context.state.workoutName : context.state.exerciseName)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Text("Set \(context.state.currentSet) of \(context.state.totalSets) • \(context.state.currentReps) reps")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(.leading, 4)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 2) {
                        if context.state.isResting, let restEnd = context.state.restEndDate {
                            Text("REST TIMER")
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(.cyan)
                            Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                                .monospacedDigit()
                                .font(.system(size: 15, weight: .black))
                                .foregroundColor(.cyan)
                        } else {
                            Text("WORKOUT")
                                .font(.system(size: 9, weight: .black))
                                .foregroundColor(Self.brandGreen)
                            Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                                .monospacedDigit()
                                .font(.system(size: 15, weight: .black))
                                .foregroundColor(Self.brandGreen)
                        }
                    }
                    .padding(.trailing, 4)
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack(alignment: .center) {
                        if context.state.caloriesBurned > 0 {
                            Label("\(context.state.caloriesBurned) kcal", systemImage: "flame.fill")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.orange)
                        } else {
                            Label("Active Session", systemImage: "bolt.fill")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(Self.brandGreen)
                        }

                        Spacer()

                        if context.state.heartRate > 0 {
                            Label("\(context.state.heartRate) bpm", systemImage: "heart.fill")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(.red)
                        }

                        Spacer()

                        Text(context.state.isPaused ? "PAUSED" : context.state.isResting ? "RESTING" : "ACTIVE")
                            .font(.system(size: 9, weight: .black))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                context.state.isPaused
                                    ? Color.orange.opacity(0.2)
                                    : context.state.isResting
                                    ? Color.cyan.opacity(0.2)
                                    : Self.brandGreen.opacity(0.2)
                            )
                            .foregroundColor(
                                context.state.isPaused
                                    ? .orange
                                    : context.state.isResting
                                    ? .cyan
                                    : Self.brandGreen
                            )
                            .cornerRadius(4)
                    }
                    .padding(.top, 4)
                    .padding(.horizontal, 4)
                }
            } compactLeading: {
                Image(systemName: context.state.isResting ? "hourglass" : "dumbbell.fill")
                    .foregroundColor(context.state.isResting ? .cyan : Self.brandGreen)
            } compactTrailing: {
                if context.state.isResting, let restEnd = context.state.restEndDate {
                    Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                        .monospacedDigit()
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(.cyan)
                } else {
                    Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                        .monospacedDigit()
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Self.brandGreen)
                }
            } minimal: {
                Image(systemName: context.state.isResting ? "hourglass" : "flame.fill")
                    .foregroundColor(context.state.isResting ? .cyan : Self.brandGreen)
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
                    Image(systemName: "flame.fill")
                        .foregroundColor(Self.brandGreen)
                    Text("CALYXO WORKOUT")
                        .font(.system(size: 11, weight: .black))
                        .foregroundColor(Self.brandGreen)
                }
                Spacer()
                Text(context.state.isPaused ? "PAUSED" : context.state.isResting ? "RESTING" : "ACTIVE")
                    .font(.system(size: 10, weight: .black))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(
                        context.state.isPaused
                            ? Color.orange.opacity(0.2)
                            : context.state.isResting
                            ? Color.cyan.opacity(0.2)
                            : Self.brandGreen.opacity(0.2)
                    )
                    .foregroundColor(
                        context.state.isPaused
                            ? .orange
                            : context.state.isResting
                            ? .cyan
                            : Self.brandGreen
                    )
                    .cornerRadius(6)
            }

            // Exercise & Metrics Row
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(context.state.exerciseName.isEmpty ? context.state.workoutName : context.state.exerciseName)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    Text("Set \(context.state.currentSet) of \(context.state.totalSets) • \(context.state.currentReps) reps")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.gray)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    if context.state.isResting, let restEnd = context.state.restEndDate {
                        Text("REST")
                            .font(.system(size: 10, weight: .black))
                            .foregroundColor(.cyan)
                        Text(timerInterval: Date()...max(Date(), restEnd), countsDown: true)
                            .monospacedDigit()
                            .font(.system(size: 22, weight: .black))
                            .foregroundColor(.cyan)
                    } else {
                        Text(timerInterval: context.state.workoutStartDate...Date.distantFuture, countsDown: false)
                            .monospacedDigit()
                            .font(.system(size: 22, weight: .black))
                            .foregroundColor(.white)
                    }
                    if context.state.caloriesBurned > 0 {
                        Text("\(context.state.caloriesBurned) kcal")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.orange)
                    }
                }
            }
        }
        .padding(14)
        .background(Color(red: 10/255, green: 10/255, blue: 12/255))
    }

    private static let brandGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
}
