import WidgetKit
import SwiftUI

// MARK: - Shared Timeline Entry
struct CalyxoWidgetEntry: TimelineEntry {
    let date: Date
    let calories: Int
    let calorieGoal: Int
    let water: Int
    let waterGoal: Int
    let protein: Int
    let proteinGoal: Int
    let carbs: Int
    let fat: Int
    let steps: Int
    let streak: Int
    let activeWorkoutName: String
    let hasData: Bool
}

// MARK: - Modern Container Background Compatibility Modifier
extension View {
    func calyxoWidgetBackground(_ color: Color = Color(red: 10/255, green: 10/255, blue: 12/255)) -> some View {
        if #available(iOS 17.0, *) {
            return AnyView(self.containerBackground(color, for: .widget))
        } else {
            return AnyView(self.background(color))
        }
    }
}

// MARK: - Timeline Provider (Real App Group Data Only)
struct CalyxoWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CalyxoWidgetEntry {
        CalyxoWidgetEntry(
            date: Date(),
            calories: 0, calorieGoal: 2000,
            water: 0, waterGoal: 2500,
            protein: 0, proteinGoal: 150,
            carbs: 0, fat: 0, steps: 0, streak: 0,
            activeWorkoutName: "",
            hasData: false
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (CalyxoWidgetEntry) -> ()) {
        completion(readSharedData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalyxoWidgetEntry>) -> ()) {
        let entry = readSharedData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func readSharedData() -> CalyxoWidgetEntry {
        let suiteName = "group.com.supreethkiran.calyxo"
        let d = UserDefaults(suiteName: suiteName) ?? .standard
        let calories = d.integer(forKey: "widget_calories")
        let calorieGoal = d.integer(forKey: "widget_calorie_goal")
        let water = d.integer(forKey: "widget_water")
        let waterGoal = d.integer(forKey: "widget_water_goal")
        let protein = d.integer(forKey: "widget_protein")
        let proteinGoal = d.integer(forKey: "widget_protein_goal")
        let carbs = d.integer(forKey: "widget_carbs")
        let fat = d.integer(forKey: "widget_fat")
        let steps = d.integer(forKey: "widget_steps")
        let streak = d.integer(forKey: "widget_streak")
        let workout = d.string(forKey: "widget_active_workout") ?? ""

        let hasData = calories > 0 || water > 0 || steps > 0 || streak > 0 || !workout.isEmpty

        return CalyxoWidgetEntry(
            date: Date(),
            calories: calories,
            calorieGoal: calorieGoal > 0 ? calorieGoal : 2000,
            water: water,
            waterGoal: waterGoal > 0 ? waterGoal : 2500,
            protein: protein,
            proteinGoal: proteinGoal > 0 ? proteinGoal : 150,
            carbs: carbs,
            fat: fat,
            steps: steps,
            streak: streak,
            activeWorkoutName: workout,
            hasData: hasData
        )
    }
}

// MARK: - Calyxo Brand Colors
private let calyxoGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
private let calyxoBg = Color(red: 10/255, green: 10/255, blue: 12/255)

// MARK: - 1. HYDRATION WIDGET VIEW
struct HydrationWidgetView: View {
    var entry: CalyxoWidgetEntry

    private var waterProgress: Double {
        guard entry.waterGoal > 0 else { return 0 }
        return min(Double(entry.water) / Double(entry.waterGoal), 1.0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "drop.fill").foregroundColor(.cyan)
                Text("HYDRATION")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(.cyan)
                Spacer()
                if entry.streak > 0 {
                    Text("🔥 \(entry.streak)d")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.orange)
                }
            }
            Spacer()
            if entry.water > 0 {
                Text("\(entry.water) ml")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                ProgressView(value: waterProgress)
                    .tint(.cyan)
                Text("\(max(0, entry.waterGoal - entry.water)) ml remaining")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.gray)
            } else {
                Text("0 ml")
                    .font(.system(size: 20, weight: .black, design: .rounded))
                    .foregroundColor(.white)
                ProgressView(value: 0.0)
                    .tint(.cyan)
                Text("Goal: \(entry.waterGoal) ml")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.gray)
            }
        }
        .padding(12)
        .calyxoWidgetBackground(calyxoBg)
    }
}

struct HydrationWidget: Widget {
    let kind = "CalyxoHydrationWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            HydrationWidgetView(entry: entry)
        }
        .configurationDisplayName("Hydration Tracker")
        .description("Track daily water consumption and hydration streaks.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 2. NUTRITION & CALORIE WIDGET VIEW
struct NutritionWidgetView: View {
    var entry: CalyxoWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "flame.fill").foregroundColor(calyxoGreen)
                Text("CALORIES")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(calyxoGreen)
                Spacer()
            }
            Spacer()
            (Text("\(entry.calories)")
                .font(.system(size: 22, weight: .black, design: .monospaced))
                .foregroundColor(.white)
            + Text(" / \(entry.calorieGoal) kcal")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.gray))

            HStack(spacing: 8) {
                Label("\(entry.protein)g P", systemImage: "circle.fill")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(calyxoGreen)
                Label("\(entry.carbs)g C", systemImage: "circle.fill")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.yellow)
                Label("\(entry.fat)g F", systemImage: "circle.fill")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.red)
            }
        }
        .padding(12)
        .calyxoWidgetBackground(calyxoBg)
    }
}

struct NutritionWidget: Widget {
    let kind = "CalyxoNutritionWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            NutritionWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Nutrition")
        .description("Track daily calories and macronutrient breakdown.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - 3. ACTIVITY & WORKOUT WIDGET VIEW
struct ActivityWidgetView: View {
    var entry: CalyxoWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "figure.run").foregroundColor(.orange)
                Text("ACTIVITY")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(.orange)
                Spacer()
            }
            Spacer()
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(entry.steps)")
                        .font(.system(size: 20, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("Steps Today")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.gray)
                }
                Spacer()
                if !entry.activeWorkoutName.isEmpty {
                    Text("💪 \(entry.activeWorkoutName)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(calyxoGreen)
                        .lineLimit(1)
                }
            }
        }
        .padding(12)
        .calyxoWidgetBackground(calyxoBg)
    }
}

struct ActivityWidget: Widget {
    let kind = "CalyxoActivityWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalyxoWidgetProvider()) { entry in
            ActivityWidgetView(entry: entry)
        }
        .configurationDisplayName("Daily Activity")
        .description("Track daily steps and active workouts.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
