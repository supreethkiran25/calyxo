import ActivityKit
import WidgetKit
import SwiftUI

@available(iOS 16.1, *)
public struct CalyxoLiveActivityWidget: Widget {
    public init() {}

    public var body: some WidgetConfiguration {
        ActivityConfiguration(for: CalyxoActivityAttributes.self) { context in
            // Lock Screen / Banner View
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    HStack(spacing: 6) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                        Text("CALYXO WORKOUT")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                    }
                    Spacer()
                    Text(context.state.isPaused ? "PAUSED" : "ACTIVE")
                        .font(.system(size: 10, weight: .black))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(context.state.isPaused ? Color.orange.opacity(0.2) : Color(red: 16/255, green: 185/255, blue: 129/255).opacity(0.2))
                        .foregroundColor(context.state.isPaused ? .orange : Color(red: 16/255, green: 185/255, blue: 129/255))
                        .cornerRadius(6)
                }

                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(context.state.exerciseName)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                        Text("Set \(context.state.currentSet) • \(context.state.currentReps) reps • ❤️ \(context.state.heartRate) bpm")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(formatSeconds(context.state.elapsedTimeSeconds))
                            .font(.system(size: 22, weight: .black, design: .monospaced))
                            .foregroundColor(.white)
                        Text("\(context.state.caloriesBurned) kcal")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.orange)
                    }
                }
            }
            .padding(14)
            .background(Color(red: 10/255, green: 10/255, blue: 12/255))
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded Dynamic Island View (Long press)
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 4) {
                        Image(systemName: "dumbbell.fill")
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                        VStack(alignment: .leading, spacing: 1) {
                            Text(context.state.exerciseName)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Text("Set \(context.state.currentSet) • \(context.state.currentReps) reps")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 1) {
                        Text(formatSeconds(context.state.elapsedTimeSeconds))
                            .font(.system(size: 14, weight: .black, design: .monospaced))
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                        if context.state.restSecondsRemaining > 0 {
                            Text("Rest \(context.state.restSecondsRemaining)s")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.cyan)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Label("\(context.state.caloriesBurned) kcal", systemImage: "flame.fill")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.orange)
                        Spacer()
                        Label("\(context.state.heartRate) bpm", systemImage: "heart.fill")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.red)
                    }
                    .padding(.top, 4)
                }
            } compactLeading: {
                Image(systemName: "flame.fill")
                    .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
            } compactTrailing: {
                Text(formatSeconds(context.state.elapsedTimeSeconds))
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
            } minimal: {
                Image(systemName: "flame.fill")
                    .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
            }
        }
    }

    private func formatSeconds(_ sec: Int) -> String {
        let m = sec / 60
        let s = sec % 60
        return String(format: "%02d:%02d", m, s)
    }
}
