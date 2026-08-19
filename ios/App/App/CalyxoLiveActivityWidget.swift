import ActivityKit
import WidgetKit
import SwiftUI

@available(iOS 16.1, *)
public struct CalyxoLiveActivityWidget: Widget {
    public init() {}

    public var body: some WidgetConfiguration {
        ActivityConfiguration(for: CalyxoActivityAttributes.self) { context in
            // Lock Screen / Banner UI Presentation
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    HStack(spacing: 6) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                        Text("CALYXO LIVE")
                            .font(.system(size: 11, weight: .bold, design: .rounded))
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                    }
                    Spacer()
                    Text(context.state.isPaused ? "PAUSED" : "ACTIVE")
                        .font(.system(size: 10, weight: .black))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(context.state.isPaused ? Color.orange.opacity(0.2) : Color.emeraldOpacity)
                        .foregroundColor(context.state.isPaused ? .orange : Color(red: 16/255, green: 185/255, blue: 129/255))
                        .cornerRadius(6)
                }

                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(context.state.workoutName)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                        Text("\(context.state.caloriesBurned) kcal • ❤️ \(context.state.heartRate) bpm")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    Text(formatSeconds(context.state.elapsedTimeSeconds))
                        .font(.system(size: 24, weight: .black, design: .monospaced))
                        .foregroundColor(.white)
                }
            }
            .padding(14)
            .background(Color(red: 10/255, green: 10/255, blue: 12/255))
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded View (Long Press on Dynamic Island)
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                        Text(context.state.workoutName)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(formatSeconds(context.state.elapsedTimeSeconds))
                        .font(.system(size: 14, weight: .black, design: .monospaced))
                        .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Label("\(context.state.caloriesBurned) kcal", systemImage: "bolt.fill")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.orange)
                        Spacer()
                        Label("\(context.state.heartRate) bpm", systemImage: "heart.fill")
                            .font(.system(size: 12, weight: .semibold))
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

extension Color {
    static let emeraldOpacity = Color(red: 16/255, green: 185/255, blue: 129/255).opacity(0.2)
}
