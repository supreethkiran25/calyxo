import SwiftUI

struct WatchMainView: View {
    @ObservedObject var manager = WatchSessionManager.shared
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Page 1: 3-Rings Nutrition Gauges
            ThreeRingsView(manager: manager)
                .tag(0)

            // Page 2: Live Workout & Rest Timer
            WorkoutWatchView(manager: manager)
                .tag(1)

            // Page 3: Quick Wrist Logger
            QuickLogView(manager: manager)
                .tag(2)
        }
        .tabViewStyle(PageTabViewStyle())
    }
}

// MARK: - 3-Rings Circular Gauge View
struct ThreeRingsView: View {
    @ObservedObject var manager: WatchSessionManager

    var calProgress: Double {
        guard manager.calorieGoal > 0 else { return 0 }
        return min(1.0, Double(manager.calories) / Double(manager.calorieGoal))
    }

    var waterProgress: Double {
        guard manager.waterGoal > 0 else { return 0 }
        return min(1.0, Double(manager.water) / Double(manager.waterGoal))
    }

    var protProgress: Double {
        guard manager.proteinGoal > 0 else { return 0 }
        return min(1.0, Double(manager.protein) / Double(manager.proteinGoal))
    }

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                // Calorie Outer Ring (Emerald)
                Circle()
                    .stroke(Color(red: 6/255, green: 78/255, blue: 59/255), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: CGFloat(calProgress))
                    .stroke(Color(red: 16/255, green: 185/255, blue: 129/255), style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))

                // Water Middle Ring (Cyan)
                Circle()
                    .stroke(Color(red: 22/255, green: 78/255, blue: 99/255), lineWidth: 5)
                    .padding(8)
                Circle()
                    .trim(from: 0, to: CGFloat(waterProgress))
                    .stroke(Color(red: 6/255, green: 182/255, blue: 212/255), style: StrokeStyle(lineWidth: 5, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .padding(8)

                // Protein Inner Ring (Purple)
                Circle()
                    .stroke(Color(red: 76/255, green: 29/255, blue: 149/255), lineWidth: 4)
                    .padding(15)
                Circle()
                    .trim(from: 0, to: CGFloat(protProgress))
                    .stroke(Color(red: 168/255, green: 85/255, blue: 247/255), style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .padding(15)

                VStack(spacing: 0) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 11))
                        .foregroundColor(Color(red: 16/255, green: 185/255, blue: 129/255))
                    Text("\(manager.calories)")
                        .font(.system(size: 14, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                }
            }
            .frame(width: 90, height: 90)

            HStack(spacing: 8) {
                Text("\(manager.water)ml")
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundColor(.cyan)
                Text("\(manager.protein)g")
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundColor(.purple)
            }
        }
        .navigationTitle("Calyxo")
    }
}

// MARK: - Live Workout Watch View
struct WorkoutWatchView: View {
    @ObservedObject var manager: WatchSessionManager

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Circle()
                    .fill(manager.isResting ? Color.cyan : Color.green)
                    .frame(width: 6, height: 6)
                Text(manager.isResting ? "REST TIMER" : "ACTIVE SET")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(manager.isResting ? .cyan : .green)
                Spacer()
                Text("SET \(manager.currentSet)/\(manager.totalSets)")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.gray)
            }

            Text(manager.activeWorkoutName)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)

            if manager.isResting {
                HStack {
                    Image(systemName: "waveform.path")
                        .foregroundColor(.cyan)
                    Text("\(manager.restSecondsRemaining)s")
                        .font(.system(size: 20, weight: .black, design: .rounded))
                        .foregroundColor(.cyan)
                }
            } else {
                HStack {
                    Image(systemName: "dumbbell.fill")
                        .foregroundColor(.green)
                    Text("Paced Set")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(.white)
                }
            }
        }
        .padding(.horizontal, 4)
        .navigationTitle("Workout")
    }
}

// MARK: - Quick Wrist Logger View
struct QuickLogView: View {
    @ObservedObject var manager: WatchSessionManager

    var body: some View {
        VStack(spacing: 6) {
            Button(action: {
                manager.logWaterQuick(amount: 250)
            }) {
                HStack {
                    Image(systemName: "drop.fill")
                        .foregroundColor(.cyan)
                    Text("+250ml Water")
                        .font(.system(size: 11, weight: .black))
                }
            }
            .background(Color.cyan.opacity(0.2))
            .cornerRadius(8)

            Button(action: {
                manager.logWaterQuick(amount: 500)
            }) {
                HStack {
                    Image(systemName: "drop.fill")
                        .foregroundColor(.cyan)
                    Text("+500ml Water")
                        .font(.system(size: 11, weight: .black))
                }
            }
            .background(Color.cyan.opacity(0.2))
            .cornerRadius(8)
        }
        .navigationTitle("Quick Log")
    }
}
